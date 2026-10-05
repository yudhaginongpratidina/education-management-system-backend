import type { DatabaseClient } from '../../config/database/types';
import type { QueryExecutor, SessionAttendanceStatus } from '../../shared/class/class.types';
import type { IClassSessionStudentRepository } from './class-session.interface';

export class ClassSessionStudentRepository implements IClassSessionStudentRepository {
    constructor(private readonly db: DatabaseClient) {}

    private executor(executor?: QueryExecutor): QueryExecutor {
        return executor ?? this.db;
    }

    async findBySession(sessionId: number): Promise<any> {
        const query = `
            SELECT
                css.session_id,
                css.student_program_id,
                css.attendance_status,
                css.notes,
                sp.student_id,
                sp.branch_id,
                s.full_name as student_name,
                pp.name as package_name,
                pl.name as level_name
            FROM class_session_students css
            JOIN student_programs sp ON css.student_program_id = sp.id
            JOIN students s ON sp.student_id = s.id
            LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
            LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
            WHERE css.session_id = ?
            ORDER BY s.full_name ASC
        `;
        const result = await this.db.query(query, [sessionId]);
        return result.rows;
    }

    async findParticipant(
        sessionId: number,
        studentProgramId: number,
        executor?: QueryExecutor,
    ): Promise<any> {
        const query = `SELECT * FROM class_session_students WHERE session_id = ? AND student_program_id = ? LIMIT 1;`;
        const result = await this.executor(executor).query(query, [sessionId, studentProgramId]);
        return result.rows[0] ?? null;
    }

    async create(
        data: {
            session_id: number;
            student_program_id: number;
            attendance_status?: SessionAttendanceStatus;
            notes?: string | null;
        },
        executor?: QueryExecutor,
    ): Promise<void> {
        const query = `
            INSERT INTO class_session_students
                (session_id, student_program_id, attendance_status, notes)
            VALUES (?, ?, ?, ?);
        `;
        await this.executor(executor).query(query, [
            data.session_id,
            data.student_program_id,
            data.attendance_status ?? 'ABSENT',
            data.notes ?? null,
        ]);
    }

    async update(
        sessionId: number,
        studentProgramId: number,
        data: { attendance_status?: SessionAttendanceStatus; notes?: string | null },
        executor?: QueryExecutor,
    ): Promise<any> {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (data.attendance_status !== undefined) {
            fields.push('attendance_status = ?');
            values.push(data.attendance_status);
        }
        if (data.notes !== undefined) {
            fields.push('notes = ?');
            values.push(data.notes);
        }

        if (fields.length > 0) {
            values.push(sessionId, studentProgramId);
            await this.executor(executor).query(
                `UPDATE class_session_students SET ${fields.join(', ')} WHERE session_id = ? AND student_program_id = ?;`,
                values,
            );
        }

        return await this.findParticipant(sessionId, studentProgramId, executor);
    }

    async remove(sessionId: number, studentProgramId: number): Promise<void> {
        await this.db.query(
            `DELETE FROM class_session_students WHERE session_id = ? AND student_program_id = ?;`,
            [sessionId, studentProgramId],
        );
    }

    async studentProgramExists(studentProgramId: number): Promise<boolean> {
        const result = await this.db.query(`SELECT 1 FROM student_programs WHERE id = ? LIMIT 1;`, [
            studentProgramId,
        ]);
        return result.rows.length > 0;
    }

    async getStudentProgram(studentProgramId: number): Promise<any> {
        const result = await this.db.query(
            `SELECT id, student_id, branch_id, status, started_at, ended_at,
                    total_sessions, sessions_per_period, session_period
             FROM student_programs WHERE id = ? LIMIT 1;`,
            [studentProgramId],
        );
        return result.rows[0] ?? null;
    }

    async isMemberOfClass(classId: number, studentProgramId: number): Promise<boolean> {
        const result = await this.db.query(
            `SELECT 1 FROM class_students WHERE class_id = ? AND student_program_id = ? AND left_at IS NULL LIMIT 1;`,
            [classId, studentProgramId],
        );
        return result.rows.length > 0;
    }

    async findStudentConflicts(
        studentProgramId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<any> {
        const conditions = [
            'css.student_program_id = ?',
            'cs.scheduled_date = ?',
            'cs.start_time < ?',
            'cs.end_time > ?',
            "cs.status NOT IN ('CANCELLED', 'RESCHEDULED')",
        ];
        const values: unknown[] = [studentProgramId, date, endTime, startTime];

        if (excludeSessionId !== undefined) {
            conditions.push('cs.id <> ?');
            values.push(excludeSessionId);
        }

        const query = `
            SELECT cs.id, cs.class_id, cs.scheduled_date, cs.start_time, cs.end_time, cs.status
            FROM class_session_students css
            JOIN class_sessions cs ON css.session_id = cs.id
            WHERE ${conditions.join(' AND ')}
            FOR UPDATE
        `;
        const result = await this.executor(executor).query(query, values);
        return result.rows;
    }

    // Number of sessions already consumed by an enrollment. Rows flagged
    // RESCHEDULED are excluded so a make-up does not double-count the quota.
    async getQuotaUsage(studentProgramId: number): Promise<any> {
        const result = await this.db.query(
            `SELECT
                COUNT(*) AS total_rows,
                COALESCE(SUM(CASE WHEN attendance_status <> 'RESCHEDULED' THEN 1 ELSE 0 END), 0) AS used,
                COALESCE(SUM(CASE WHEN attendance_status = 'RESCHEDULED' THEN 1 ELSE 0 END), 0) AS rescheduled
             FROM class_session_students
             WHERE student_program_id = ?;`,
            [studentProgramId],
        );
        return result.rows[0] ?? { total_rows: 0, used: 0, rescheduled: 0 };
    }

    // Active members of a class together with their enrollment quota usage.
    async findClassMembersWithQuota(classId: number): Promise<any> {
        const result = await this.db.query(
            `SELECT
                cs.student_program_id,
                sp.student_id,
                s.full_name AS student_name,
                sp.branch_id,
                bs.name AS branch_name,
                pp.name AS package_name,
                pl.name AS level_name,
                sp.status AS enrollment_status,
                sp.started_at,
                sp.ended_at,
                sp.total_sessions,
                sp.sessions_per_period,
                sp.session_period,
                COALESCE(SUM(CASE WHEN css.attendance_status <> 'RESCHEDULED' THEN 1 ELSE 0 END), 0) AS used,
                COALESCE(SUM(CASE WHEN css.attendance_status = 'RESCHEDULED' THEN 1 ELSE 0 END), 0) AS rescheduled
             FROM class_students cs
             JOIN student_programs sp ON cs.student_program_id = sp.id
             JOIN students s ON sp.student_id = s.id
             LEFT JOIN branches bs ON sp.branch_id = bs.id
             LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
             LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
             LEFT JOIN class_session_students css ON css.student_program_id = sp.id
             WHERE cs.class_id = ? AND cs.left_at IS NULL
             GROUP BY cs.student_program_id, sp.student_id, s.full_name, sp.branch_id, bs.name,
                      pp.name, pl.name, sp.status, sp.started_at, sp.ended_at, sp.total_sessions,
                      sp.sessions_per_period, sp.session_period
             ORDER BY s.full_name ASC;`,
            [classId],
        );
        return result.rows;
    }
}
