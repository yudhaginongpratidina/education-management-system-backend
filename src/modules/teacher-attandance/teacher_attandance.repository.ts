import type { DatabaseClient } from '../../config/database/types';
import type { ITeacherAttendanceRepository } from './teacher_attandance.interface';

const formatToMySqlDateTime = (isoString?: string | null): string | null => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const formatToMySqlDate = (isoString?: string | null): string | null => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toISOString().slice(0, 10);
};

export class TeacherAttendanceRepository implements ITeacherAttendanceRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_attendance(data: {
        teacher_id: number;
        branch_id: number;
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
        is_approved?: boolean;
    }): Promise<any> {
        const query = `
            INSERT INTO teacher_attendances (
                teacher_id, branch_id, status, attendance_date, check_in_at, check_in_photo, 
                check_out_at, check_out_photo, check_in_latitude, check_in_longitude, 
                check_out_latitude, check_out_longitude, notes, is_approved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            data.teacher_id,
            data.branch_id,
            data.status,
            formatToMySqlDate(data.attendance_date),
            formatToMySqlDateTime(data.check_in_at),
            data.check_in_photo ?? null,
            formatToMySqlDateTime(data.check_out_at),
            data.check_out_photo ?? null,
            data.check_in_latitude ?? null,
            data.check_in_longitude ?? null,
            data.check_out_latitude ?? null,
            data.check_out_longitude ?? null,
            data.notes ?? null,
            data.is_approved ? 1 : 0,
        ];
        await this.db.query(query, values);

        const selectQuery = `SELECT * FROM teacher_attendances WHERE teacher_id = ? AND attendance_date = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [
            data.teacher_id,
            formatToMySqlDate(data.attendance_date),
        ]);
        return result.rows[0];
    }

    async update_attendance(data: {
        id: number;
        teacher_id: number;
        branch_id: number;
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
        is_approved?: boolean;
    }): Promise<any> {
        const query = `
            UPDATE teacher_attendances SET 
                teacher_id = ?, branch_id = ?, status = ?, attendance_date = ?, check_in_at = ?, 
                check_in_photo = ?, check_out_at = ?, check_out_photo = ?, 
                check_in_latitude = ?, check_in_longitude = ?, check_out_latitude = ?, 
                check_out_longitude = ?, notes = ?, is_approved = ?
            WHERE id = ?;
        `;
        const values = [
            data.teacher_id,
            data.branch_id,
            data.status,
            formatToMySqlDate(data.attendance_date),
            formatToMySqlDateTime(data.check_in_at),
            data.check_in_photo ?? null,
            formatToMySqlDateTime(data.check_out_at),
            data.check_out_photo ?? null,
            data.check_in_latitude ?? null,
            data.check_in_longitude ?? null,
            data.check_out_latitude ?? null,
            data.check_out_longitude ?? null,
            data.notes ?? null,
            data.is_approved ? 1 : 0,
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
            conditions.push('ta.id = ?');
            values.push(filter.id);
        }
        if (filter.teacher_id !== undefined) {
            conditions.push('ta.teacher_id = ?');
            values.push(filter.teacher_id);
        }
        if (filter.status !== undefined) {
            conditions.push('ta.status = ?');
            values.push(filter.status);
        }
        if (filter.attendance_date !== undefined) {
            conditions.push('ta.attendance_date = ?');
            values.push(filter.attendance_date);
        }

        let query = `
            SELECT 
                ta.*, 
                t.full_name as teacher_name, t.slug as teacher_slug,
                b.name as branch_name, b.slug as branch_slug
            FROM teacher_attendances ta
            JOIN teachers t ON ta.teacher_id = t.id
            JOIN branches b ON ta.branch_id = b.id
        `;
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

    async report_teacher(filter: {
        teacher_id?: number;
        from_date?: string;
        to_date?: string;
    }): Promise<any> {
        const { teacher_id, from_date, to_date } = filter;

        const detailsQuery = `
            SELECT
                ta.id,
                ta.teacher_id,
                ta.branch_id,
                t.full_name as teacher_name, t.slug as teacher_slug,
                b.name as branch_name, b.slug as branch_slug,
                ta.attendance_date,
                ta.check_in_at,
                ta.check_out_at,
                TIMEDIFF(ta.check_out_at, ta.check_in_at) as duration,
                ta.status
            FROM teacher_attendances ta
            JOIN teachers t ON ta.teacher_id = t.id
            JOIN branches b ON ta.branch_id = b.id
            WHERE (? IS NULL OR ta.teacher_id = ?)
              AND ta.attendance_date >= ?
              AND ta.attendance_date <= ?;
        `;

        const statsQuery = `
            SELECT
                status,
                COUNT(*) as count
            FROM teacher_attendances
            WHERE (? IS NULL OR teacher_id = ?)
              AND attendance_date >= ?
              AND attendance_date <= ?
            GROUP BY status;
        `;

        const details = await this.db.query(detailsQuery, [
            teacher_id ?? null,
            teacher_id ?? null,
            from_date,
            to_date,
        ]);
        const stats = await this.db.query(statsQuery, [
            teacher_id ?? null,
            teacher_id ?? null,
            from_date,
            to_date,
        ]);

        return {
            details: details.rows,
            stats: stats.rows,
        };
    }
}
