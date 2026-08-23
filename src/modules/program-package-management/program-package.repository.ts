// config and interface
import type { DatabaseClient } from '../../config/database/types';
import type { IProgramPackageRepository } from './program-package.interface';

export class ProgramPackageRepository implements IProgramPackageRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_package(data: {
        program_id: number;
        name: string;
        slug: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months: number;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const query = `INSERT INTO program_packages (program_id, name, slug, duration_months, sessions_count, session_period, normal_price, selling_price, bonus_duration_months, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            data.program_id,
            data.name,
            data.slug,
            data.duration_months,
            data.sessions_count,
            data.session_period,
            data.normal_price,
            data.selling_price,
            data.bonus_duration_months,
            data.status,
        ]);

        const selectQuery = `SELECT * FROM program_packages WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.slug]);
        return result.rows[0];
    }

    async get_packages(
        filter: {
            id?: number;
            program_id?: number;
            slug?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.id !== undefined) {
            conditions.push('id = ?');
            values.push(filter.id);
        }
        if (filter.program_id !== undefined) {
            conditions.push('program_id = ?');
            values.push(filter.program_id);
        }
        if (filter.slug !== undefined) {
            conditions.push('slug = ?');
            values.push(filter.slug);
        }
        if (filter.status !== undefined) {
            conditions.push('status = ?');
            values.push(filter.status);
        }

        let query = `SELECT * FROM program_packages`;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }

        const response = await this.db.query(query, values);
        return response.rows;
    }

    async update_package(data: {
        old_slug: string;
        new_slug: string;
        program_id: number;
        name: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months: number;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const query = `UPDATE program_packages SET slug = ?, name = ?, duration_months = ?, sessions_count = ?, session_period = ?, normal_price = ?, selling_price = ?, bonus_duration_months = ?, status = ? WHERE slug = ?;`;
        await this.db.query(query, [
            data.new_slug,
            data.name,
            data.duration_months,
            data.sessions_count,
            data.session_period,
            data.normal_price,
            data.selling_price,
            data.bonus_duration_months,
            data.status,
            data.old_slug,
        ]);

        const selectQuery = `SELECT * FROM program_packages WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.new_slug]);
        return result.rows[0];
    }

    async delete_package(slug: string): Promise<any> {
        const query = `DELETE FROM program_packages WHERE slug = ?;`;
        return await this.db.query(query, [slug]);
    }
}
