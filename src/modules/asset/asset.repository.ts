import type { DatabaseClient } from '../../config/database/types';
import type {
    AssetCategoryInput,
    AssetFilter,
    AssetInput,
    IAssetRepository,
} from './asset.interface';

const ASSET_SELECT = `
    SELECT
        a.*,
        ac.name AS category_name,
        ac.code_prefix AS category_code_prefix,
        b.name AS branch_name,
        u.full_name AS responsible_user_name,
        TIMESTAMPDIFF(MONTH, a.purchase_date, CURDATE()) AS age_months,
        CASE
            WHEN a.useful_life_years IS NOT NULL AND a.purchase_date IS NOT NULL
            THEN a.useful_life_years * 12 - TIMESTAMPDIFF(MONTH, a.purchase_date, CURDATE())
            ELSE NULL
        END AS remaining_months
    FROM assets a
    JOIN asset_categories ac ON a.category_id = ac.id
    LEFT JOIN branches b ON a.branch_id = b.id
    LEFT JOIN users u ON a.responsible_user_id = u.id
`;

const MOVEMENT_SELECT = `
    SELECT
        m.*,
        fb.name AS from_branch_name,
        tb.name AS to_branch_name,
        fu.full_name AS from_responsible_user_name,
        tu.full_name AS to_responsible_user_name
    FROM asset_movements m
    LEFT JOIN branches fb ON m.from_branch_id = fb.id
    LEFT JOIN branches tb ON m.to_branch_id = tb.id
    LEFT JOIN users fu ON m.from_responsible_user_id = fu.id
    LEFT JOIN users tu ON m.to_responsible_user_id = tu.id
`;

export class AssetRepository implements IAssetRepository {
    constructor(private readonly db: DatabaseClient) {}

    // ============================================================
    // CATEGORIES
    // ============================================================
    async createCategory(data: AssetCategoryInput): Promise<any> {
        await this.db.query(
            `INSERT INTO asset_categories (name, slug, code_prefix, description, is_active)
             VALUES (?, ?, ?, ?, ?);`,
            [
                data.name,
                data.slug,
                data.code_prefix ?? null,
                data.description ?? null,
                data.is_active === false ? 0 : 1,
            ],
        );
        const result = await this.db.query(
            `SELECT * FROM asset_categories WHERE id = LAST_INSERT_ID();`,
        );
        return result.rows[0];
    }

    async findCategories(filter: { search?: string }): Promise<any[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];
        if (filter.search) {
            conditions.push('(name LIKE ? OR slug LIKE ? OR code_prefix LIKE ?)');
            const term = `%${filter.search}%`;
            values.push(term, term, term);
        }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const result = await this.db.query(
            `SELECT ac.*,
                (SELECT COUNT(*) FROM assets a WHERE a.category_id = ac.id) AS asset_count
             FROM asset_categories ac
             ${where}
             ORDER BY ac.name ASC`,
            values,
        );
        return result.rows;
    }

    async findCategoryById(id: number): Promise<any | null> {
        const result = await this.db.query(`SELECT * FROM asset_categories WHERE id = ? LIMIT 1;`, [
            id,
        ]);
        return result.rows[0] ?? null;
    }

    async findCategoryByName(name: string): Promise<any | null> {
        const result = await this.db.query(
            `SELECT * FROM asset_categories WHERE name = ? LIMIT 1;`,
            [name],
        );
        return result.rows[0] ?? null;
    }

    async updateCategory(id: number, data: Partial<AssetCategoryInput>): Promise<any | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(key === 'is_active' ? (value ? 1 : 0) : value);
            }
        }
        if (fields.length > 0) {
            values.push(id);
            await this.db.query(
                `UPDATE asset_categories SET ${fields.join(', ')} WHERE id = ?;`,
                values,
            );
        }
        return await this.findCategoryById(id);
    }

    async deleteCategory(id: number): Promise<void> {
        await this.db.query(`DELETE FROM asset_categories WHERE id = ?;`, [id]);
    }

    async countAssetsInCategory(id: number): Promise<number> {
        const result = await this.db.query(
            `SELECT COUNT(*) AS total FROM assets WHERE category_id = ?;`,
            [id],
        );
        return Number(result.rows[0]?.total ?? 0);
    }

    // ============================================================
    // ASSETS
    // ============================================================
    async createAsset(data: AssetInput): Promise<any> {
        await this.db.query(
            `INSERT INTO assets
                (name, category_id, branch_id, location, purchase_date, purchase_price,
                 useful_life_years, \`condition\`, status, responsible_user_id, responsible_name, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                data.name,
                data.category_id,
                data.branch_id ?? null,
                data.location ?? null,
                data.purchase_date ?? null,
                data.purchase_price ?? 0,
                data.useful_life_years ?? null,
                data.condition ?? 'GOOD',
                data.status ?? 'ACTIVE',
                data.responsible_user_id ?? null,
                data.responsible_name ?? null,
                data.notes ?? null,
            ],
        );
        const result = await this.db.query(`SELECT * FROM assets WHERE id = LAST_INSERT_ID();`);
        return result.rows[0];
    }

    async updateAsset(id: number, data: Partial<AssetInput>): Promise<any | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(key === 'condition' ? '`condition` = ?' : `${key} = ?`);
                values.push(value);
            }
        }
        if (fields.length > 0) {
            values.push(id);
            await this.db.query(`UPDATE assets SET ${fields.join(', ')} WHERE id = ?;`, values);
        }
        return await this.findAssetById(id);
    }

    async updateAssetCode(id: number, code: string): Promise<void> {
        await this.db.query(`UPDATE assets SET code = ? WHERE id = ?;`, [code, id]);
    }

    async deleteAsset(id: number): Promise<void> {
        await this.db.query(`DELETE FROM assets WHERE id = ?;`, [id]);
    }

    async findAssetById(id: number): Promise<any | null> {
        const result = await this.db.query(`${ASSET_SELECT} WHERE a.id = ? LIMIT 1;`, [id]);
        return result.rows[0] ?? null;
    }

    private buildAssetFilters(filter: AssetFilter): { sql: string; values: unknown[] } {
        const conditions: string[] = [];
        const values: unknown[] = [];
        if (filter.search) {
            conditions.push('(a.name LIKE ? OR a.code LIKE ? OR a.location LIKE ?)');
            const term = `%${filter.search}%`;
            values.push(term, term, term);
        }
        if (filter.category_id) {
            conditions.push('a.category_id = ?');
            values.push(filter.category_id);
        }
        if (filter.branch_id) {
            conditions.push('a.branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.status) {
            conditions.push('a.status = ?');
            values.push(filter.status);
        }
        if (filter.condition) {
            conditions.push('a.`condition` = ?');
            values.push(filter.condition);
        }
        return {
            sql: conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '',
            values,
        };
    }

    async findAssets(
        filter: AssetFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]> {
        const { sql, values } = this.buildAssetFilters(filter);
        const sortable: Record<string, string> = {
            name: 'a.name',
            code: 'a.code',
            purchase_date: 'a.purchase_date',
            purchase_price: 'a.purchase_price',
            created_at: 'a.created_at',
            status: 'a.status',
        };
        const sortColumn = sortable[filter.sort ?? ''] ?? 'a.created_at';
        const order = filter.order === 'asc' ? 'ASC' : 'DESC';

        let query = `${ASSET_SELECT}${sql} ORDER BY ${sortColumn} ${order}`;
        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }
        const result = await this.db.query(query, values);
        return result.rows;
    }

    async assetSummary(filter: AssetFilter): Promise<any> {
        const { sql, values } = this.buildAssetFilters(filter);
        const result = await this.db.query(
            `SELECT
                COUNT(*) AS total,
                COALESCE(SUM(a.purchase_price), 0) AS total_value,
                SUM(CASE WHEN a.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN a.status = 'IN_USE' THEN 1 ELSE 0 END) AS in_use,
                SUM(CASE WHEN a.status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance,
                SUM(CASE WHEN a.status = 'RETIRED' THEN 1 ELSE 0 END) AS retired,
                SUM(CASE WHEN a.status = 'LOST' THEN 1 ELSE 0 END) AS lost,
                SUM(CASE WHEN a.status = 'DISPOSED' THEN 1 ELSE 0 END) AS disposed,
                SUM(CASE WHEN a.\`condition\` = 'GOOD' THEN 1 ELSE 0 END) AS good,
                SUM(CASE WHEN a.\`condition\` = 'FAIR' THEN 1 ELSE 0 END) AS fair,
                SUM(CASE WHEN a.\`condition\` = 'DAMAGED' THEN 1 ELSE 0 END) AS damaged,
                SUM(CASE WHEN a.\`condition\` = 'BROKEN' THEN 1 ELSE 0 END) AS broken,
                SUM(CASE
                    WHEN a.useful_life_years IS NOT NULL AND a.purchase_date IS NOT NULL
                     AND TIMESTAMPDIFF(MONTH, a.purchase_date, CURDATE()) >= a.useful_life_years * 12
                    THEN 1 ELSE 0 END) AS expired,
                SUM(CASE
                    WHEN a.useful_life_years IS NOT NULL AND a.purchase_date IS NOT NULL
                     AND TIMESTAMPDIFF(MONTH, a.purchase_date, CURDATE()) < a.useful_life_years * 12
                     AND (a.useful_life_years * 12 - TIMESTAMPDIFF(MONTH, a.purchase_date, CURDATE())) <= 6
                    THEN 1 ELSE 0 END) AS near_end
             FROM assets a
             ${sql}`,
            values,
        );
        return result.rows[0] ?? {};
    }

    // ============================================================
    // MOVEMENTS
    // ============================================================
    async createMovement(data: any): Promise<any> {
        await this.db.query(
            `INSERT INTO asset_movements
                (asset_id, movement_date, from_branch_id, to_branch_id, from_location, to_location,
                 from_responsible_user_id, to_responsible_user_id,
                 from_responsible_name, to_responsible_name, notes, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                data.asset_id,
                data.movement_date,
                data.from_branch_id ?? null,
                data.to_branch_id ?? null,
                data.from_location ?? null,
                data.to_location ?? null,
                data.from_responsible_user_id ?? null,
                data.to_responsible_user_id ?? null,
                data.from_responsible_name ?? null,
                data.to_responsible_name ?? null,
                data.notes ?? null,
                data.created_by ?? null,
            ],
        );
        const result = await this.db.query(
            `SELECT * FROM asset_movements WHERE id = LAST_INSERT_ID();`,
        );
        return result.rows[0];
    }

    async findMovementsByAsset(assetId: number): Promise<any[]> {
        const result = await this.db.query(
            `${MOVEMENT_SELECT} WHERE m.asset_id = ? ORDER BY m.movement_date DESC, m.id DESC;`,
            [assetId],
        );
        return result.rows;
    }
}
