import type { DatabaseClient } from '../../config/database/types';
import type { IProgramLevelRepository } from './prorgam-level.interface';

export class ProgramLevelRepository implements IProgramLevelRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_level(data: {
        program_id: number;
        level: number;
        name: string;
        description?: string | null;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const query = `INSERT INTO program_levels (program_id, level, name, description, status) VALUES (?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            data.program_id,
            data.level,
            data.name,
            data.description ?? null,
            data.status,
        ]);

        const selectQuery = `SELECT * FROM program_levels WHERE program_id = ? AND level = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.program_id, data.level]);
        return result.rows[0];
    }

    async get_levels(
        filter: {
            id?: number;
            program_id?: number;
            level?: number;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: {
            limit: number;
            offset: number;
        },
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
        if (filter.level !== undefined) {
            conditions.push('level = ?');
            values.push(filter.level);
        }
        if (filter.status !== undefined) {
            conditions.push('status = ?');
            values.push(filter.status);
        }

        let query = `SELECT * FROM program_levels`;
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

    async update_level(data: {
        id: number;
        level: number;
        name: string;
        description?: string | null;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const query = `UPDATE program_levels SET level = ?, name = ?, description = ?, status = ? WHERE id = ?;`;
        await this.db.query(query, [
            data.level,
            data.name,
            data.description ?? null,
            data.status,
            data.id,
        ]);

        const selectQuery = `SELECT * FROM program_levels WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async delete_level(data: { program_id: number; level: number }): Promise<any> {
        const query = `DELETE FROM program_levels WHERE program_id = ? AND level = ?;`;
        return await this.db.query(query, [data.program_id, data.level]);
    }
}
