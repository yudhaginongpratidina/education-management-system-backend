import type { DatabaseClient } from '../../config/database/types';
import type { ClassSessionStatus, QueryExecutor } from '../../shared/class/class.types';
import type { ITeacherSessionRepository, TeacherSessionFilter } from './teacher-session.interface';

// Columns shared by every session query so responses are consistent for the client.
const SESSION_SELECT = `
    SELECT
        cs.*,
        c.name AS class_name,
        c.code AS class_code,
        c.description AS class_description,
        c.branch_id,
        b.name AS branch_name,
        b.address AS branch_address,
        b.latitude AS branch_latitude,
        b.longitude AS branch_longitude,
        t.full_name AS teacher_name,
        (
            SELECT COUNT(*)
            FROM class_session_students x
            WHERE x.session_id = cs.id
        ) AS participant_count,
        (
            SELECT COUNT(*)
            FROM class_session_students x
            WHERE x.session_id = cs.id AND x.attendance_status = 'PRESENT'
        ) AS present_count
    FROM class_sessions cs
    JOIN classes c ON cs.class_id = c.id
    LEFT JOIN branches b ON c.branch_id = b.id
    LEFT JOIN teachers t ON cs.teacher_id = t.id
`;

export class TeacherSessionRepository implements ITeacherSessionRepository {
    constructor(private readonly db: DatabaseClient) {}

    private executor(executor?: QueryExecutor): QueryExecutor {
        return executor ?? this.db;
    }

    private buildFilters(filter: TeacherSessionFilter): { sql: string; values: unknown[] } {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.teacher_id !== undefined) {
            conditions.push('cs.teacher_id = ?');
            values.push(filter.teacher_id);
        }
        if (filter.scheduled_date !== undefined) {
            conditions.push('cs.scheduled_date = ?');
            values.push(filter.scheduled_date);
        }
        if (filter.date_from !== undefined) {
            conditions.push('cs.scheduled_date >= ?');
            values.push(filter.date_from);
        }
        if (filter.date_to !== undefined) {
            conditions.push('cs.scheduled_date <= ?');
            values.push(filter.date_to);
        }
        if (filter.status !== undefined) {
            conditions.push('cs.status = ?');
            values.push(filter.status);
        }

        return {
            sql: conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '',
            values,
        };
    }

    async findTeacherByUserId(userId: number): Promise<any | null> {
        const result = await this.db.query(`SELECT * FROM teachers WHERE user_id = ? LIMIT 1;`, [
            userId,
        ]);
        return result.rows[0] ?? null;
    }

    async findAll(filter: TeacherSessionFilter, pagination?: Pagination): Promise<any[]> {
        const { sql, values } = this.buildFilters(filter);
        let query = `${SESSION_SELECT}${sql} ORDER BY cs.scheduled_date ASC, cs.start_time ASC`;

        if (pagination) {
            query += ' LIMIT ? OFFSET ?';
            values.push(pagination.limit, pagination.offset);
        }

        const result = await this.db.query(query, values);
        return result.rows;
    }

    async findById(sessionId: number, executor?: QueryExecutor): Promise<any | null> {
        const result = await this.executor(executor).query(
            `${SESSION_SELECT} WHERE cs.id = ? LIMIT 1`,
            [sessionId],
        );
        return result.rows[0] ?? null;
    }

    async findSchedule(teacherId: number): Promise<any[]> {
        const query = `
            SELECT
                sc.id,
                sc.class_id,
                sc.day_of_week,
                sc.start_time,
                sc.end_time,
                sc.effective_from,
                sc.effective_until,
                sc.is_active,
                c.name AS class_name,
                c.code AS class_code,
                c.status AS class_status,
                c.branch_id,
                b.name AS branch_name,
                b.address AS branch_address,
                ct.role AS teacher_role
            FROM class_schedules sc
            JOIN classes c ON sc.class_id = c.id
            JOIN class_teachers ct ON ct.class_id = c.id AND ct.teacher_id = ?
            LEFT JOIN branches b ON c.branch_id = b.id
            WHERE sc.is_active = TRUE
              AND ct.started_at <= CURDATE()
              AND (ct.ended_at IS NULL OR ct.ended_at >= CURDATE())
            ORDER BY sc.day_of_week ASC, sc.start_time ASC
        `;
        const result = await this.db.query(query, [teacherId]);
        return result.rows;
    }

    async findSummary(teacherId: number, filter: TeacherSessionFilter): Promise<any[]> {
        // Summary only cares about the teacher + date window, never a single status.
        const { sql, values } = this.buildFilters({
            ...filter,
            teacher_id: teacherId,
            status: undefined,
        });
        const query = `
            SELECT cs.status, COUNT(*) AS count
            FROM class_sessions cs
            ${sql}
            GROUP BY cs.status
        `;
        const result = await this.db.query(query, values);
        return result.rows;
    }

    async updateStatus(sessionId: number, status: ClassSessionStatus): Promise<any | null> {
        await this.db.query(`UPDATE class_sessions SET status = ? WHERE id = ?;`, [
            status,
            sessionId,
        ]);
        return await this.findById(sessionId);
    }
}
