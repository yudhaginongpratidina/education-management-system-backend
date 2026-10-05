import type { DatabaseClient } from '../../config/database/types';
import type { CashflowFilter, CashflowInput, ICashflowRepository } from './cashflow.interface';

export class CashflowRepository implements ICashflowRepository {
    constructor(private readonly db: DatabaseClient) {}

    private buildFilters(filter: CashflowFilter): { sql: string; values: unknown[] } {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.date_from) {
            conditions.push('cf.transaction_date >= ?');
            values.push(filter.date_from);
        }
        if (filter.date_to) {
            conditions.push('cf.transaction_date <= ?');
            values.push(filter.date_to);
        }
        if (filter.type) {
            conditions.push('cf.type = ?');
            values.push(filter.type);
        }
        if (filter.branch_id) {
            conditions.push('cf.branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.category) {
            conditions.push('cf.category = ?');
            values.push(filter.category);
        }
        if (filter.search) {
            conditions.push('(cf.description LIKE ? OR cf.category LIKE ? OR cf.reference LIKE ?)');
            const term = `%${filter.search}%`;
            values.push(term, term, term);
        }

        return {
            sql: conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '',
            values,
        };
    }

    async create(data: CashflowInput): Promise<any> {
        await this.db.query(
            `INSERT INTO cashflow_transactions
                (branch_id, transaction_date, type, category, description, amount,
                 payment_method, reference, notes, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                data.branch_id ?? null,
                data.transaction_date,
                data.type,
                data.category ?? null,
                data.description,
                data.amount,
                data.payment_method ?? null,
                data.reference ?? null,
                data.notes ?? null,
                data.created_by ?? null,
            ],
        );
        const result = await this.db.query(
            `SELECT * FROM cashflow_transactions WHERE id = LAST_INSERT_ID();`,
        );
        return result.rows[0];
    }

    async update(id: number, data: Partial<CashflowInput>): Promise<any | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        if (fields.length > 0) {
            values.push(id);
            await this.db.query(
                `UPDATE cashflow_transactions SET ${fields.join(', ')} WHERE id = ?;`,
                values,
            );
        }
        return await this.findById(id);
    }

    async delete(id: number): Promise<void> {
        await this.db.query(`DELETE FROM cashflow_transactions WHERE id = ?;`, [id]);
    }

    async findById(id: number): Promise<any | null> {
        const result = await this.db.query(
            `SELECT cf.*, b.name AS branch_name
             FROM cashflow_transactions cf
             LEFT JOIN branches b ON cf.branch_id = b.id
             WHERE cf.id = ? LIMIT 1;`,
            [id],
        );
        return result.rows[0] ?? null;
    }

    async findAll(
        filter: CashflowFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]> {
        const { sql, values } = this.buildFilters(filter);

        // Running balance ("Sisa") computed over the whole filtered set, then
        // paginated for display.
        let query = `
            SELECT
                t.*,
                SUM(t.signed) OVER (ORDER BY t.transaction_date ASC, t.id ASC) AS running_balance
            FROM (
                SELECT
                    cf.id,
                    cf.branch_id,
                    b.name AS branch_name,
                    cf.transaction_date,
                    cf.type,
                    cf.category,
                    cf.description,
                    cf.amount,
                    cf.payment_method,
                    cf.reference,
                    cf.notes,
                    cf.created_at,
                    cf.updated_at,
                    CASE WHEN cf.type = 'INCOME' THEN cf.amount ELSE -cf.amount END AS signed
                FROM cashflow_transactions cf
                LEFT JOIN branches b ON cf.branch_id = b.id
                ${sql}
            ) t
            ORDER BY t.transaction_date DESC, t.id DESC
        `;
        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }
        const result = await this.db.query(query, values);
        return result.rows;
    }

    async totals(filter: CashflowFilter): Promise<any> {
        const { sql, values } = this.buildFilters(filter);
        const result = await this.db.query(
            `SELECT
                COALESCE(SUM(CASE WHEN cf.type = 'INCOME' THEN cf.amount ELSE 0 END), 0) AS total_in,
                COALESCE(SUM(CASE WHEN cf.type = 'EXPENSE' THEN cf.amount ELSE 0 END), 0) AS total_out,
                COUNT(*) AS total_transactions
             FROM cashflow_transactions cf
             ${sql}`,
            values,
        );
        return result.rows[0] ?? {};
    }

    async monthlySeries(filter: CashflowFilter): Promise<any[]> {
        const { sql, values } = this.buildFilters(filter);
        const result = await this.db.query(
            `SELECT
                DATE_FORMAT(cf.transaction_date, '%Y-%m') AS month,
                SUM(CASE WHEN cf.type = 'INCOME' THEN cf.amount ELSE 0 END) AS income,
                SUM(CASE WHEN cf.type = 'EXPENSE' THEN cf.amount ELSE 0 END) AS expense
             FROM cashflow_transactions cf
             ${sql}
             GROUP BY month
             ORDER BY month ASC`,
            values,
        );
        return result.rows;
    }

    async byCategory(filter: CashflowFilter): Promise<any[]> {
        const { sql, values } = this.buildFilters(filter);
        const result = await this.db.query(
            `SELECT
                cf.type,
                COALESCE(cf.category, 'Tanpa Kategori') AS category,
                SUM(cf.amount) AS total,
                COUNT(*) AS count
             FROM cashflow_transactions cf
             ${sql}
             GROUP BY cf.type, cf.category
             ORDER BY total DESC`,
            values,
        );
        return result.rows;
    }
}
