import type { DatabaseClient } from '../../config/database/types';
import type { IUserRepository } from './user.interface';

export class UserRepository implements IUserRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_user(data: {
        full_name: string;
        slug: string;
        email: string;
        password_hash: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any> {
        const query = `INSERT INTO users (full_name, slug, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            data.full_name,
            data.slug,
            data.email,
            data.password_hash,
            data.role ?? null,
            data.avatar ?? null,
        ]);
        const selectQuery = `SELECT * FROM users WHERE email = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.email]);
        return result.rows[0];
    }

    async get_user(
        filter: { id?: number; slug?: string; email?: string; role?: string | null },
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
        if (filter.email !== undefined) {
            conditions.push('email = ?');
            values.push(filter.email);
        }
        if (filter.role !== undefined) {
            conditions.push('role = ?');
            values.push(filter.role);
        }

        let query = `SELECT id, full_name, slug, email, role, avatar, created_at, updated_at FROM users`;
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

    async update_user(data: {
        id: number;
        full_name: string;
        slug: string;
        email: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any> {
        const query = `UPDATE users SET full_name = ?, slug = ?, email = ?, role = ?, avatar = ? WHERE id = ?;`;
        await this.db.query(query, [
            data.full_name,
            data.slug,
            data.email,
            data.role ?? null,
            data.avatar ?? null,
            data.id,
        ]);
        const selectQuery = `SELECT id, full_name, slug, email, role, avatar, created_at, updated_at FROM users WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async update_password(data: { id: number; password_hash: string }): Promise<any> {
        const query = `UPDATE users SET password_hash = ? WHERE id = ?;`;
        return await this.db.query(query, [data.password_hash, data.id]);
    }

    async delete_user(slug: string): Promise<any> {
        const query = `DELETE FROM users WHERE slug = ?;`;
        return await this.db.query(query, [slug]);
    }
}
