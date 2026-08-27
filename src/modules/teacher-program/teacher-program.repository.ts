import type { DatabaseClient } from '../../config/database/types';
import type { ITeacherProgramRepository } from './teacher-program.interface';

export class TeacherProgramRepository implements ITeacherProgramRepository {
    constructor(private readonly db: DatabaseClient) {}

    async bulk_create_teacher_program(
        data: {
            teacher_id: number;
            program_id: number;
        }[],
    ): Promise<any> {
        if (data.length === 0) return;

        const query = `INSERT INTO teacher_programs (teacher_id, program_id) VALUES ?;`;
        const values = data.map((item) => [item.teacher_id, item.program_id]);

        // Assuming database driver handles batch insert with array of arrays
        await this.db.query(query, [values]);
        return { success: true };
    }

    async get_teacher_programs(filter: { teacher_id?: number; program_id?: number }): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.teacher_id !== undefined) {
            conditions.push('tp.teacher_id = ?');
            values.push(filter.teacher_id);
        }
        if (filter.program_id !== undefined) {
            conditions.push('tp.program_id = ?');
            values.push(filter.program_id);
        }

        let query = `
            SELECT 
                tp.teacher_id, 
                tp.program_id,
                t.full_name as teacher_name,
                t.slug as teacher_slug,
                p.name as program_name,
                p.slug as program_slug
            FROM teacher_programs tp
            JOIN teachers t ON tp.teacher_id = t.id
            JOIN programs p ON tp.program_id = p.id
        `;

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const response = await this.db.query(query, values);
        return response.rows;
    }

    async delete_teacher_program(data: { teacher_id: number; program_id: number }): Promise<any> {
        const query = `DELETE FROM teacher_programs WHERE teacher_id = ? AND program_id = ?;`;
        return await this.db.query(query, [data.teacher_id, data.program_id]);
    }
}
