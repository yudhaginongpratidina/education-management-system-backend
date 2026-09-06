import type { DatabaseClient } from '../../config/database/types';
import type { IBranchRepository } from './branch.interface';

export class BranchRepository implements IBranchRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_branch(data: {
        name: string;
        slug: string;
        address: string;
        latitude: string;
        longitude: string;
        radius: string;
    }): Promise<any> {
        const query = `INSERT INTO branches (name, slug, address, latitude, longitude, radius) VALUES (?, ?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            data.name,
            data.slug,
            data.address,
            data.latitude,
            data.longitude,
            data.radius,
        ]);
        const selectQuery = `SELECT * FROM branches WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.slug]);
        return result.rows[0];
    }

    async get_branch(filter: { id?: number; name?: string; slug?: string }): Promise<any> {
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

        let query = `SELECT id, name, slug, address, latitude, longitude, radius, created_at, updated_at FROM branches`;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const response = await this.db.query(query, values);
        return filter.id || filter.name || filter.slug ? response.rows[0] : response.rows;
    }

    async update_branch(data: {
        id: number;
        name?: string;
        slug?: string;
        address?: string;
        latitude?: string;
        longitude?: string;
        radius?: string;
    }): Promise<any> {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.slug !== undefined) {
            fields.push('slug = ?');
            values.push(data.slug);
        }
        if (data.address !== undefined) {
            fields.push('address = ?');
            values.push(data.address);
        }
        if (data.latitude !== undefined) {
            fields.push('latitude = ?');
            values.push(data.latitude);
        }
        if (data.longitude !== undefined) {
            fields.push('longitude = ?');
            values.push(data.longitude);
        }
        if (data.radius !== undefined) {
            fields.push('radius = ?');
            values.push(data.radius);
        }

        if (fields.length === 0) return null;

        values.push(data.id);
        const query = `UPDATE branches SET ${fields.join(', ')} WHERE id = ?;`;
        await this.db.query(query, values);

        const selectQuery = `SELECT id, name, slug, address, latitude, longitude, radius, created_at, updated_at FROM branches WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async delete_branch(slug: string): Promise<any> {
        const query = `DELETE FROM branches WHERE slug = ?;`;
        return await this.db.query(query, [slug]);
    }
}
