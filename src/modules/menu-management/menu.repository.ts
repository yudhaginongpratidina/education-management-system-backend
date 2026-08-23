import type { DatabaseClient } from '../../config/database/types';
import type { IMenuRepository } from './menu.interface';

export class MenuRepository implements IMenuRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_menu(data: any): Promise<any> {
        const query = `INSERT INTO menus (parent_id, name, slug, type, icon, url, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            data.parent_id ?? null,
            data.name,
            data.slug,
            data.type,
            data.icon ?? null,
            data.url ?? null,
            data.description ?? null,
            data.sort_order ?? 0,
            data.is_active ?? true,
        ]);

        const selectQuery = `SELECT * FROM menus WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.slug]);
        return result.rows[0];
    }

    async get_menu(
        filter: {
            id?: number;
            parent_id?: number | null;
            name?: string;
            slug?: string;
            type?: 'GROUP' | 'ITEM';
            is_active?: boolean;
        } = {},
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.id !== undefined) {
            conditions.push('id = ?');
            values.push(filter.id);
        }
        if (filter.parent_id !== undefined) {
            conditions.push('parent_id = ?');
            values.push(filter.parent_id);
        }
        if (filter.name !== undefined) {
            conditions.push('name = ?');
            values.push(filter.name);
        }
        if (filter.slug !== undefined) {
            conditions.push('slug = ?');
            values.push(filter.slug);
        }
        if (filter.type !== undefined) {
            conditions.push('type = ?');
            values.push(filter.type);
        }
        if (filter.is_active !== undefined) {
            conditions.push('is_active = ?');
            values.push(filter.is_active);
        }

        let query = `SELECT * FROM menus`;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY sort_order ASC`;

        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }

        const response = await this.db.query(query, values);
        return response.rows;
    }

    async update_menu(data: any): Promise<any> {
        const query = `UPDATE menus SET parent_id = ?, name = ?, slug = ?, type = ?, icon = ?, url = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?;`;
        await this.db.query(query, [
            data.parent_id ?? null,
            data.name,
            data.slug,
            data.type,
            data.icon ?? null,
            data.url ?? null,
            data.description ?? null,
            data.sort_order ?? 0,
            data.is_active ?? true,
            data.id,
        ]);

        const selectQuery = `SELECT * FROM menus WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async delete_menu(slug: string): Promise<any> {
        const query = `DELETE FROM menus WHERE slug = ?;`;
        const result = await this.db.query(query, [slug]);
        return result;
    }
}
