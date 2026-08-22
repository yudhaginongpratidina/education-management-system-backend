// config and interface
import type { DatabaseClient } from '../../config/database/types';
import type { IRoleMenuRepository } from './role-menu.interface';

export class RoleMenuRepository implements IRoleMenuRepository {
    constructor(private readonly db: DatabaseClient) {}

    async assign_menu(data: { role_id: number; menu_id: number }): Promise<any> {
        const query = `INSERT INTO role_menus (role_id, menu_id) VALUES (?, ?);`;
        return await this.db.query(query, [data.role_id, data.menu_id]);
    }

    async get_role_menus(filter: { role_id?: number; menu_id?: number }): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.role_id !== undefined) {
            conditions.push('role_id = ?');
            values.push(filter.role_id);
        }
        if (filter.menu_id !== undefined) {
            conditions.push('menu_id = ?');
            values.push(filter.menu_id);
        }

        let query = `SELECT * FROM role_menus`;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const response = await this.db.query(query, values);
        return response.rows;
    }

    async unassign_menu(data: { role_id: number; menu_id: number }): Promise<any> {
        const query = `DELETE FROM role_menus WHERE role_id = ? AND menu_id = ?;`;
        return await this.db.query(query, [data.role_id, data.menu_id]);
    }

    async sync_menus(data: { role_id: number; menu_ids: number[] }): Promise<any> {
        await this.db.query(`DELETE FROM role_menus WHERE role_id = ?;`, [data.role_id]);

        if (data.menu_ids.length > 0) {
            const placeholders = data.menu_ids.map(() => '(?, ?)').join(', ');
            const values = data.menu_ids.flatMap((menu_id) => [data.role_id, menu_id]);
            const query = `INSERT INTO role_menus (role_id, menu_id) VALUES ${placeholders};`;
            await this.db.query(query, values);
        }
        return { success: true };
    }
}
