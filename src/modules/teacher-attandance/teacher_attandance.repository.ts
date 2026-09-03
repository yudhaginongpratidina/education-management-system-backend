import type { DatabaseClient } from '../../config/database/types';
import type { ITeacherAttendanceRepository } from './teacher_attandance.interface';

const formatToMySqlDateTime = (isoString?: string | null): string | null => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

export class TeacherAttendanceRepository implements ITeacherAttendanceRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_attendance(data: {
        teacher_id: number;
        status:
            | 'PRESENT'
            | 'ABSENT'
            | 'SICK'
            | 'LEAVE'
            | 'REMOTE'
            | 'OFFICIAL_DUTY'
            | 'HOLIDAY'
            | 'LATE';
        attendance_date: string;
        check_in_at?: string | null;
        check_in_photo?: string | null;
        check_out_at?: string | null;
        check_out_photo?: string | null;
        check_in_latitude?: number | null;
        check_in_longitude?: number | null;
        check_out_latitude?: number | null;
        check_out_longitude?: number | null;
        notes?: string | null;
    }): Promise<any> {
        const query = `
            INSERT INTO teacher_attendances (
                teacher_id, status, attendance_date, check_in_at, check_in_photo, 
                check_out_at, check_out_photo, check_in_latitude, check_in_longitude, 
                check_out_latitude, check_out_longitude, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            data.teacher_id,
            data.status,
            data.attendance_date,
            formatToMySqlDateTime(data.check_in_at),
            data.check_in_photo ?? null,
            formatToMySqlDateTime(data.check_out_at),
            data.check_out_photo ?? null,
            data.check_in_latitude ?? null,
            data.check_in_longitude ?? null,
            data.check_out_latitude ?? null,
            data.check_out_longitude ?? null,
            data.notes ?? null,
        ];
        await this.db.query(query, values);

        const selectQuery = `SELECT * FROM teacher_attendances WHERE teacher_id = ? AND attendance_date = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.teacher_id, data.attendance_date]);
        return result.rows[0];
    }

    async update_attendance(data: {
        id: number;
        teacher_id: number;
        status:
            | 'PRESENT'
            | 'ABSENT'
            | 'SICK'
            | 'LEAVE'
            | 'REMOTE'
            | 'OFFICIAL_DUTY'
            | 'HOLIDAY'
            | 'LATE';
        attendance_date: string;
        check_in_at?: string | null;
        check_in_photo?: string | null;
        check_out_at?: string | null;
        check_out_photo?: string | null;
        check_in_latitude?: number | null;
        check_in_longitude?: number | null;
        check_out_latitude?: number | null;
        check_out_longitude?: number | null;
        notes?: string | null;
    }): Promise<any> {
        const query = `
            UPDATE teacher_attendances SET 
                teacher_id = ?, status = ?, attendance_date = ?, check_in_at = ?, 
                check_in_photo = ?, check_out_at = ?, check_out_photo = ?, 
                check_in_latitude = ?, check_in_longitude = ?, check_out_latitude = ?, 
                check_out_longitude = ?, notes = ?
            WHERE id = ?;
        `;
        const values = [
            data.teacher_id,
            data.status,
            data.attendance_date,
            formatToMySqlDateTime(data.check_in_at),
            data.check_in_photo ?? null,
            formatToMySqlDateTime(data.check_out_at),
            data.check_out_photo ?? null,
            data.check_in_latitude ?? null,
            data.check_in_longitude ?? null,
            data.check_out_latitude ?? null,
            data.check_out_longitude ?? null,
            data.notes ?? null,
            data.id,
        ];
        await this.db.query(query, values);

        const selectQuery = `SELECT * FROM teacher_attendances WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async get_attendance(filter: {
        id?: number;
        teacher_id?: number;
        status?:
            | 'PRESENT'
            | 'ABSENT'
            | 'SICK'
            | 'LEAVE'
            | 'REMOTE'
            | 'OFFICIAL_DUTY'
            | 'HOLIDAY'
            | 'LATE';
        attendance_date?: string;
    }): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.id !== undefined) {
            conditions.push('id = ?');
            values.push(filter.id);
        }
        if (filter.teacher_id !== undefined) {
            conditions.push('teacher_id = ?');
            values.push(filter.teacher_id);
        }
        if (filter.status !== undefined) {
            conditions.push('status = ?');
            values.push(filter.status);
        }
        if (filter.attendance_date !== undefined) {
            conditions.push('attendance_date = ?');
            values.push(filter.attendance_date);
        }

        let query = `SELECT * FROM teacher_attendances`;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const response = await this.db.query(query, values);
        return response.rows;
    }

    async delete_attendance(id: number): Promise<any> {
        const query = `DELETE FROM teacher_attendances WHERE id = ?;`;
        return await this.db.query(query, [id]);
    }
}
