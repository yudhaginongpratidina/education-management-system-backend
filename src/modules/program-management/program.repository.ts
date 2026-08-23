// config and interface
import type { DatabaseClient } from '../../config/database/types';
import type { IProgramRepository } from './program.interface';

// utils
import { create_slug } from '../../shared/libs/slug';

export class ProgramRepository implements IProgramRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_program(data: {
        name: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const slug = create_slug(data.name);
        const query = `INSERT INTO programs (slug, name, description, requirements, price_per_session, status) VALUES (?, ?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            slug,
            data.name,
            data.description ?? null,
            data.requirements ?? null,
            data.price_per_session,
            data.status ?? 'ACTIVE',
        ]);

        const selectQuery = `SELECT * FROM programs WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [slug]);
        return result.rows[0];
    }

    async get_program(
        filter: { id?: number; slug?: string; name?: string; status?: 'ACTIVE' | 'INACTIVE' },
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.id !== undefined) {
            conditions.push('id = ?');
            values.push(filter.id);
        }
        if (filter.slug !== undefined) {
            conditions.push('slug = ?');
            values.push(filter.slug);
        }
        if (filter.name !== undefined) {
            conditions.push('name = ?');
            values.push(filter.name);
        }
        if (filter.status !== undefined) {
            conditions.push('status = ?');
            values.push(filter.status);
        }

        let query = `SELECT * FROM programs`;
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

    async update_program(data: {
        slug: string;
        name: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const query = `UPDATE programs SET name = ?, description = ?, requirements = ?, price_per_session = ?, status = ? WHERE slug = ?;`;
        await this.db.query(query, [
            data.name,
            data.description ?? null,
            data.requirements ?? null,
            data.price_per_session,
            data.status ?? 'ACTIVE',
            data.slug,
        ]);

        const selectQuery = `SELECT * FROM programs WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.slug]);
        return result.rows[0];
    }

    async delete_program(slug: string): Promise<any> {
        const query = `DELETE FROM programs WHERE slug = ?;`;
        return await this.db.query(query, [slug]);
    }
}
