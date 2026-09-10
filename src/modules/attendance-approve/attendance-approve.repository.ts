import type { DatabaseClient } from '../../config/database/types';
import type { IAttendanceApproveRepository } from './attendance-approve.interface';

export class AttendanceApproveRepository implements IAttendanceApproveRepository {
    constructor(private readonly db: DatabaseClient) {}

    async approve_attendance(data: {
        id: number;
        is_approved: boolean;
        notes?: string | null;
    }): Promise<any> {
        const query = `
            UPDATE teacher_attendances SET
                is_approved = ?, notes = ?
            WHERE id = ?;
        `;
        const values = [data.is_approved ? 1 : 0, data.notes ?? null, data.id];
        await this.db.query(query, values);

        const selectQuery = `SELECT * FROM teacher_attendances WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async get_unapproved_attendances(branch_id: number): Promise<any[]> {
        const query = `
            SELECT ta.*, t.full_name as teacher_name
            FROM teacher_attendances ta
            JOIN teachers t ON ta.teacher_id = t.id
            WHERE ta.branch_id = ? AND ta.is_approved = 0;
        `;
        const result = await this.db.query(query, [branch_id]);
        return result.rows;
    }
}
