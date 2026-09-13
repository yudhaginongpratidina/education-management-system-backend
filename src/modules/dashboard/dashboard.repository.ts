import type { DatabaseClient } from '../../config/database/types';
import type { IDashboardRepository } from './dashboard.interface';

export class DashboardRepository implements IDashboardRepository {
    constructor(private readonly db: DatabaseClient) {}

    async get_total_branch(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM branches;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_teacher(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM teachers;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_program(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM programs;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_role(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM roles;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_menu(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM menus;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_user(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM users;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }
}
