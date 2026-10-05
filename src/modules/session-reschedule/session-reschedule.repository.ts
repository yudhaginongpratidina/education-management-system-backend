import type { DatabaseClient } from '../../config/database/types';
import type { QueryExecutor } from '../../shared/class/class.types';
import type {
    ISessionRescheduleRepository,
    SessionRescheduleFilter,
    SessionRescheduleInput,
} from './session-reschedule.interface';

export class SessionRescheduleRepository implements ISessionRescheduleRepository {
    constructor(private readonly db: DatabaseClient) {}

    private executor(executor?: QueryExecutor): QueryExecutor {
        return executor ?? this.db;
    }

    async create(data: SessionRescheduleInput, executor?: QueryExecutor): Promise<void> {
        const query = `
            INSERT INTO session_reschedules (
                type, class_id, student_program_id, from_session_id, to_session_id,
                from_teacher_id, to_teacher_id, reason, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await this.executor(executor).query(query, [
            data.type,
            data.class_id ?? null,
            data.student_program_id ?? null,
            data.from_session_id ?? null,
            data.to_session_id ?? null,
            data.from_teacher_id ?? null,
            data.to_teacher_id ?? null,
            data.reason ?? null,
            data.created_by ?? null,
        ]);
    }

    async findAll(
        filter: SessionRescheduleFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.type !== undefined) {
            conditions.push('sr.type = ?');
            values.push(filter.type);
        }
        if (filter.class_id !== undefined) {
            conditions.push('sr.class_id = ?');
            values.push(filter.class_id);
        }
        if (filter.student_program_id !== undefined) {
            conditions.push('sr.student_program_id = ?');
            values.push(filter.student_program_id);
        }
        if (filter.date_from !== undefined) {
            conditions.push('DATE(sr.created_at) >= ?');
            values.push(filter.date_from);
        }
        if (filter.date_to !== undefined) {
            conditions.push('DATE(sr.created_at) <= ?');
            values.push(filter.date_to);
        }

        let query = `
            SELECT
                sr.*,
                c.name AS class_name,
                s.full_name AS student_name,
                fs.scheduled_date AS from_date,
                fs.start_time AS from_start_time,
                fs.end_time AS from_end_time,
                ts.scheduled_date AS to_date,
                ts.start_time AS to_start_time,
                ts.end_time AS to_end_time,
                ft.full_name AS from_teacher_name,
                tt.full_name AS to_teacher_name
            FROM session_reschedules sr
            LEFT JOIN classes c ON sr.class_id = c.id
            LEFT JOIN student_programs sp ON sr.student_program_id = sp.id
            LEFT JOIN students s ON sp.student_id = s.id
            LEFT JOIN class_sessions fs ON sr.from_session_id = fs.id
            LEFT JOIN class_sessions ts ON sr.to_session_id = ts.id
            LEFT JOIN teachers ft ON sr.from_teacher_id = ft.id
            LEFT JOIN teachers tt ON sr.to_teacher_id = tt.id
        `;

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ` ORDER BY sr.created_at DESC, sr.id DESC`;

        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }

        const result = await this.db.query(query, values);
        return result.rows;
    }

    async findById(id: number): Promise<any | null> {
        const result = await this.db.query(
            `SELECT * FROM session_reschedules WHERE id = ? LIMIT 1;`,
            [id],
        );
        return result.rows[0] ?? null;
    }
}
