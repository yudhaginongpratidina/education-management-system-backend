// config and interface
import type { DatabaseClient } from '../../config/database/types';
import type { IRoleRepository } from './role.interface';

export class RoleRepository implements IRoleRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_role(data: { name: string; slug: string; description: string }): Promise<any> {
        const query = `INSERT INTO roles (name, slug, description) VALUES (?, ?, ?);`;
        await this.db.query(query, [data.name, data.slug, data.description]);

        const selectQuery = `SELECT * FROM roles WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.slug]);
        return result.rows[0];
    }

    async update_role(data: {
        id: number;
        name: string;
        slug: string;
        description: string;
    }): Promise<any> {
        const query = `UPDATE roles SET name = ?, slug = ?, description = ? WHERE id = ?;`;
        await this.db.query(query, [data.name, data.slug, data.description, data.id]);

        const selectQuery = `SELECT * FROM roles WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async delete_role(slug: string): Promise<any> {
        const query = `DELETE FROM roles WHERE slug = ?;`;
        await this.db.query(query, [slug]);
    }

    async get_role(
        filter: { id?: number; name?: string; slug?: string } = {},
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.id !== undefined) {
            conditions.push('id = ?');
            values.push(filter.id);
        }

        if (filter.name !== undefined) {
            conditions.push('name = ?');
            values.push(filter.name);
        }

        if (filter.slug !== undefined) {
            conditions.push('slug = ?');
            values.push(filter.slug);
        }

        let query = `SELECT * FROM roles`;
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
}
