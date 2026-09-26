import type { DatabaseClient } from '../../config/database/types';
import type { Pagination } from '../../shared/class/class.types';
import type { ClassListFilter, IClassRepository } from './class.interface';

const SORTABLE_COLUMNS = new Set(['name', 'code', 'status', 'created_at', 'updated_at']);

export class ClassRepository implements IClassRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create(data: {
        branch_id: number;
        name: string;
        code: string;
        description?: string | null;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const query = `INSERT INTO classes (branch_id, name, code, description, status) VALUES (?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            data.branch_id,
            data.name,
            data.code,
            data.description ?? null,
            data.status ?? 'ACTIVE',
        ]);

        const result = await this.db.query(`SELECT * FROM classes WHERE id = LAST_INSERT_ID();`);
        return result.rows[0];
    }

    async findAll(filter: ClassListFilter, pagination?: Pagination): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.branch_id !== undefined) {
            conditions.push('branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.status !== undefined) {
            conditions.push('status = ?');
            values.push(filter.status);
        }
        if (filter.search) {
            conditions.push('(name LIKE ? OR code LIKE ?)');
            const like = `%${filter.search}%`;
            values.push(like, like);
        }

        let query = `SELECT * FROM classes`;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const sortBy =
            filter.sort_by && SORTABLE_COLUMNS.has(filter.sort_by) ? filter.sort_by : 'created_at';
        const sortOrder = (filter.sort_order ?? 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }

        const result = await this.db.query(query, values);
        return result.rows;
    }

    async findById(id: number): Promise<any> {
        const result = await this.db.query(`SELECT * FROM classes WHERE id = ? LIMIT 1;`, [id]);
        return result.rows[0] ?? null;
    }

    async findByCode(code: string, excludeId?: number): Promise<any> {
        const conditions = ['code = ?'];
        const values: unknown[] = [code];
        if (excludeId !== undefined) {
            conditions.push('id <> ?');
            values.push(excludeId);
        }
        const result = await this.db.query(
            `SELECT * FROM classes WHERE ${conditions.join(' AND ')} LIMIT 1;`,
            values,
        );
        return result.rows[0] ?? null;
    }

    async update(id: number, data: Record<string, unknown>): Promise<any> {
        const fields: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return await this.findById(id);

        values.push(id);
        await this.db.query(`UPDATE classes SET ${fields.join(', ')} WHERE id = ?;`, values);
        return await this.findById(id);
    }

    async delete(id: number): Promise<void> {
        await this.db.query(`DELETE FROM classes WHERE id = ?;`, [id]);
    }

    async branchExists(branchId: number): Promise<boolean> {
        const result = await this.db.query(`SELECT 1 FROM branches WHERE id = ? LIMIT 1;`, [
            branchId,
        ]);
        return result.rows.length > 0;
    }
}
