import type { DatabaseClient } from '../../config/database/types';
import type {
    IManualAttendanceInput,
    IManualAttendanceFilter,
    IManualAttendanceRecord,
    IManualAttendanceRepository,
} from './manual-attendance.interface';

const formatToMySqlDateTime = (val?: string | null): string | null => {
    if (!val) return null;
    // If it's just "08:00", we can't store as timestamp directly without date
    const clean = val.replace('T', ' ').replace('Z', '').split('.')[0];
    return clean;
};

const formatToMySqlDate = (val?: string | null): string => {
    if (!val) return new Date().toISOString().split('T')[0];
    return val.split('T')[0];
};

export class ManualAttendanceRepository implements IManualAttendanceRepository {
    constructor(private readonly db: DatabaseClient) {}

    async record(data: IManualAttendanceInput): Promise<IManualAttendanceRecord> {
        const formattedDate = formatToMySqlDate(data.attendance_date);

        // Check if a record already exists for this teacher on this date and branch
        const checkQuery = `
            SELECT id FROM teacher_attendances 
            WHERE teacher_id = ? AND branch_id = ? AND attendance_date = ? 
            LIMIT 1;
        `;
        const checkResult = await this.db.query(checkQuery, [
            data.teacher_id,
            data.branch_id,
            formattedDate,
        ]);

        if (checkResult.rows.length > 0) {
            // Update existing record
            const existingId = checkResult.rows[0].id;
            return await this.update(existingId, data);
        }

        // Insert new record
        const insertQuery = `
            INSERT INTO teacher_attendances (
                teacher_id, branch_id, status, attendance_date,
                check_in_at, check_in_photo, check_out_at, check_out_photo,
                notes, is_approved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            data.teacher_id,
            data.branch_id,
            data.status,
            formattedDate,
            formatToMySqlDateTime(data.check_in_at),
            data.check_in_photo ?? null,
            formatToMySqlDateTime(data.check_out_at),
            data.check_out_photo ?? null,
            data.notes ?? null,
            (data.is_approved ?? true) ? 1 : 0,
        ];

        await this.db.query(insertQuery, values);

        const selectQuery = `
            SELECT id FROM teacher_attendances 
            WHERE teacher_id = ? AND branch_id = ? AND attendance_date = ? 
            ORDER BY id DESC LIMIT 1;
        `;
        const selectResult = await this.db.query(selectQuery, [
            data.teacher_id,
            data.branch_id,
            formattedDate,
        ]);
        const insertId = selectResult.rows[0]?.id;

        const created = await this.getById(insertId);
        return created!;
    }

    async get(filter: IManualAttendanceFilter): Promise<IManualAttendanceRecord[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.teacher_id !== undefined) {
            conditions.push('ta.teacher_id = ?');
            values.push(filter.teacher_id);
        }

        if (filter.branch_id !== undefined) {
            conditions.push('ta.branch_id = ?');
            values.push(filter.branch_id);
        }

        if (filter.status !== undefined) {
            conditions.push('ta.status = ?');
            values.push(filter.status);
        }

        if (filter.date !== undefined && filter.date.trim() !== '') {
            conditions.push('ta.attendance_date = ?');
            values.push(formatToMySqlDate(filter.date));
        }

        if (filter.from_date !== undefined && filter.from_date.trim() !== '') {
            conditions.push('ta.attendance_date >= ?');
            values.push(formatToMySqlDate(filter.from_date));
        }

        if (filter.to_date !== undefined && filter.to_date.trim() !== '') {
            conditions.push('ta.attendance_date <= ?');
            values.push(formatToMySqlDate(filter.to_date));
        }

        let query = `
            SELECT 
                ta.*,
                t.full_name AS teacher_name,
                t.slug AS teacher_slug,
                b.name AS branch_name,
                b.slug AS branch_slug
            FROM teacher_attendances ta
            JOIN teachers t ON ta.teacher_id = t.id
            JOIN branches b ON ta.branch_id = b.id
        `;

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY ta.attendance_date DESC, ta.id DESC;`;

        const result = await this.db.query(query, values);
        return result.rows.map((row: any) => ({
            ...row,
            is_approved: Boolean(row.is_approved),
        }));
    }

    async getById(id: number): Promise<IManualAttendanceRecord | null> {
        const query = `
            SELECT 
                ta.*,
                t.full_name AS teacher_name,
                t.slug AS teacher_slug,
                b.name AS branch_name,
                b.slug AS branch_slug
            FROM teacher_attendances ta
            JOIN teachers t ON ta.teacher_id = t.id
            JOIN branches b ON ta.branch_id = b.id
            WHERE ta.id = ?
            LIMIT 1;
        `;
        const result = await this.db.query(query, [id]);
        if (!result.rows[0]) return null;

        return {
            ...result.rows[0],
            is_approved: Boolean(result.rows[0].is_approved),
        };
    }

    async update(
        id: number,
        data: Partial<IManualAttendanceInput>,
    ): Promise<IManualAttendanceRecord> {
        const updates: string[] = [];
        const values: unknown[] = [];

        if (data.teacher_id !== undefined) {
            updates.push('teacher_id = ?');
            values.push(data.teacher_id);
        }
        if (data.branch_id !== undefined) {
            updates.push('branch_id = ?');
            values.push(data.branch_id);
        }
        if (data.status !== undefined) {
            updates.push('status = ?');
            values.push(data.status);
        }
        if (data.attendance_date !== undefined) {
            updates.push('attendance_date = ?');
            values.push(formatToMySqlDate(data.attendance_date));
        }
        if (data.check_in_at !== undefined) {
            updates.push('check_in_at = ?');
            values.push(formatToMySqlDateTime(data.check_in_at));
        }
        if (data.check_in_photo !== undefined) {
            updates.push('check_in_photo = ?');
            values.push(data.check_in_photo);
        }
        if (data.check_out_at !== undefined) {
            updates.push('check_out_at = ?');
            values.push(formatToMySqlDateTime(data.check_out_at));
        }
        if (data.check_out_photo !== undefined) {
            updates.push('check_out_photo = ?');
            values.push(data.check_out_photo);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            values.push(data.notes);
        }
        if (data.is_approved !== undefined) {
            updates.push('is_approved = ?');
            values.push(data.is_approved ? 1 : 0);
        }

        if (updates.length > 0) {
            const query = `UPDATE teacher_attendances SET ${updates.join(', ')} WHERE id = ?;`;
            values.push(id);
            await this.db.query(query, values);
        }

        const updated = await this.getById(id);
        return updated!;
    }

    async delete(id: number): Promise<void> {
        const query = `DELETE FROM teacher_attendances WHERE id = ?;`;
        await this.db.query(query, [id]);
    }
}
