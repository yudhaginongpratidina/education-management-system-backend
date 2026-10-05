import type { DatabaseClient } from '../../config/database/types';
import type { IReportRepository, ReportFilter } from './report.interface';

export class ReportRepository implements IReportRepository {
    constructor(private readonly db: DatabaseClient) {}

    private pushDateRange(
        column: string,
        filter: ReportFilter,
        conditions: string[],
        values: unknown[],
    ): void {
        if (filter.date_from) {
            conditions.push(`${column} >= ?`);
            values.push(filter.date_from);
        }
        if (filter.date_to) {
            conditions.push(`${column} <= ?`);
            values.push(filter.date_to);
        }
    }

    private where(conditions: string[]): string {
        return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    }

    // ============================================================
    // TEACHER ATTENDANCE (datang, keluar, durasi)
    // ============================================================
    async teacherAttendance(filter: ReportFilter): Promise<any[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];
        this.pushDateRange('ta.attendance_date', filter, conditions, values);
        if (filter.branch_id) {
            conditions.push('ta.branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.teacher_id) {
            conditions.push('ta.teacher_id = ?');
            values.push(filter.teacher_id);
        }
        if (filter.status) {
            conditions.push('ta.status = ?');
            values.push(filter.status);
        }

        const result = await this.db.query(
            `SELECT
                ta.id,
                ta.teacher_id,
                t.full_name AS teacher_name,
                t.slug AS teacher_slug,
                ta.branch_id,
                b.name AS branch_name,
                ta.status,
                ta.attendance_date,
                ta.check_in_at,
                ta.check_out_at,
                TIMESTAMPDIFF(MINUTE, ta.check_in_at, ta.check_out_at) AS duration_minutes,
                ta.notes,
                ta.is_approved
             FROM teacher_attendances ta
             JOIN teachers t ON ta.teacher_id = t.id
             LEFT JOIN branches b ON ta.branch_id = b.id
             ${this.where(conditions)}
             ORDER BY ta.attendance_date DESC, ta.check_in_at DESC`,
            values,
        );
        return result.rows;
    }

    async teacherAttendanceStats(filter: ReportFilter): Promise<any[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];
        this.pushDateRange('ta.attendance_date', filter, conditions, values);
        if (filter.branch_id) {
            conditions.push('ta.branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.teacher_id) {
            conditions.push('ta.teacher_id = ?');
            values.push(filter.teacher_id);
        }

        const result = await this.db.query(
            `SELECT
                ta.status,
                COUNT(*) AS count,
                COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ta.check_in_at, ta.check_out_at)), 0) AS minutes
             FROM teacher_attendances ta
             ${this.where(conditions)}
             GROUP BY ta.status`,
            values,
        );
        return result.rows;
    }

    // ============================================================
    // STUDENT ATTENDANCE
    // ============================================================
    private studentAttendanceConditions(filter: ReportFilter): {
        conditions: string[];
        values: unknown[];
    } {
        const conditions: string[] = [];
        const values: unknown[] = [];
        this.pushDateRange('cs.scheduled_date', filter, conditions, values);
        if (filter.branch_id) {
            conditions.push('sp.branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.class_id) {
            conditions.push('cs.class_id = ?');
            values.push(filter.class_id);
        }
        if (filter.status) {
            conditions.push('css.attendance_status = ?');
            values.push(filter.status);
        }
        return { conditions, values };
    }

    async studentAttendance(
        filter: ReportFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]> {
        const { conditions, values } = this.studentAttendanceConditions(filter);
        let query = `
            SELECT
                css.session_id,
                css.student_program_id,
                css.attendance_status,
                css.notes,
                s.id AS student_id,
                s.full_name AS student_name,
                sp.branch_id,
                b.name AS branch_name,
                cs.scheduled_date,
                cs.start_time,
                cs.end_time,
                c.name AS class_name,
                c.code AS class_code,
                t.full_name AS teacher_name
            FROM class_session_students css
            JOIN class_sessions cs ON css.session_id = cs.id
            JOIN classes c ON cs.class_id = c.id
            JOIN student_programs sp ON css.student_program_id = sp.id
            JOIN students s ON sp.student_id = s.id
            LEFT JOIN branches b ON sp.branch_id = b.id
            LEFT JOIN teachers t ON cs.teacher_id = t.id
            ${this.where(conditions)}
            ORDER BY cs.scheduled_date DESC, cs.start_time DESC, s.full_name ASC
        `;
        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }
        const result = await this.db.query(query, values);
        return result.rows;
    }

    async studentAttendanceSummary(filter: ReportFilter): Promise<any[]> {
        const { conditions, values } = this.studentAttendanceConditions(filter);
        const result = await this.db.query(
            `SELECT
                s.id AS student_id,
                s.full_name AS student_name,
                b.name AS branch_name,
                COUNT(*) AS total,
                SUM(CASE WHEN css.attendance_status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN css.attendance_status = 'ABSENT' THEN 1 ELSE 0 END) AS absent,
                SUM(CASE WHEN css.attendance_status = 'SICK' THEN 1 ELSE 0 END) AS sick,
                SUM(CASE WHEN css.attendance_status = 'PERMISSION' THEN 1 ELSE 0 END) AS permission,
                SUM(CASE WHEN css.attendance_status = 'RESCHEDULED' THEN 1 ELSE 0 END) AS rescheduled
             FROM class_session_students css
             JOIN class_sessions cs ON css.session_id = cs.id
             JOIN student_programs sp ON css.student_program_id = sp.id
             JOIN students s ON sp.student_id = s.id
             LEFT JOIN branches b ON sp.branch_id = b.id
             ${this.where(conditions)}
             GROUP BY s.id, s.full_name, b.name
             ORDER BY absent DESC, s.full_name ASC`,
            values,
        );
        return result.rows;
    }

    // ============================================================
    // SESSION REPORT
    // ============================================================
    async sessionReport(filter: ReportFilter): Promise<any[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];
        this.pushDateRange('cs.scheduled_date', filter, conditions, values);
        if (filter.branch_id) {
            conditions.push('c.branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.class_id) {
            conditions.push('cs.class_id = ?');
            values.push(filter.class_id);
        }
        if (filter.teacher_id) {
            conditions.push('cs.teacher_id = ?');
            values.push(filter.teacher_id);
        }
        if (filter.status) {
            conditions.push('cs.status = ?');
            values.push(filter.status);
        }

        const result = await this.db.query(
            `SELECT
                cs.id,
                cs.class_id,
                c.name AS class_name,
                c.code AS class_code,
                b.name AS branch_name,
                t.full_name AS teacher_name,
                cs.scheduled_date,
                cs.start_time,
                cs.end_time,
                cs.status,
                COUNT(css.student_program_id) AS participant_count,
                SUM(CASE WHEN css.attendance_status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN css.attendance_status = 'ABSENT' THEN 1 ELSE 0 END) AS absent,
                SUM(CASE WHEN css.attendance_status = 'SICK' THEN 1 ELSE 0 END) AS sick,
                SUM(CASE WHEN css.attendance_status = 'PERMISSION' THEN 1 ELSE 0 END) AS permission,
                SUM(CASE WHEN css.attendance_status = 'RESCHEDULED' THEN 1 ELSE 0 END) AS rescheduled
             FROM class_sessions cs
             JOIN classes c ON cs.class_id = c.id
             LEFT JOIN branches b ON c.branch_id = b.id
             LEFT JOIN teachers t ON cs.teacher_id = t.id
             LEFT JOIN class_session_students css ON css.session_id = cs.id
             ${this.where(conditions)}
             GROUP BY cs.id, cs.class_id, c.name, c.code, b.name, t.full_name,
                      cs.scheduled_date, cs.start_time, cs.end_time, cs.status
             ORDER BY cs.scheduled_date DESC, cs.start_time DESC`,
            values,
        );
        return result.rows;
    }

    // ============================================================
    // RESCHEDULE REPORT
    // ============================================================
    async rescheduleReport(
        filter: ReportFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]> {
        const conditions: string[] = [];
        const values: unknown[] = [];
        this.pushDateRange('DATE(sr.created_at)', filter, conditions, values);
        if (filter.type) {
            conditions.push('sr.type = ?');
            values.push(filter.type);
        }
        if (filter.branch_id) {
            conditions.push('c.branch_id = ?');
            values.push(filter.branch_id);
        }

        let query = `
            SELECT
                sr.id,
                sr.type,
                sr.class_id,
                c.name AS class_name,
                sr.student_program_id,
                s.full_name AS student_name,
                sr.from_session_id,
                sr.to_session_id,
                fs.scheduled_date AS from_date,
                fs.start_time AS from_start_time,
                fs.end_time AS from_end_time,
                ts.scheduled_date AS to_date,
                ts.start_time AS to_start_time,
                ts.end_time AS to_end_time,
                ft.full_name AS from_teacher_name,
                tt.full_name AS to_teacher_name,
                sr.reason,
                sr.created_at
            FROM session_reschedules sr
            LEFT JOIN classes c ON sr.class_id = c.id
            LEFT JOIN student_programs sp ON sr.student_program_id = sp.id
            LEFT JOIN students s ON sp.student_id = s.id
            LEFT JOIN class_sessions fs ON sr.from_session_id = fs.id
            LEFT JOIN class_sessions ts ON sr.to_session_id = ts.id
            LEFT JOIN teachers ft ON sr.from_teacher_id = ft.id
            LEFT JOIN teachers tt ON sr.to_teacher_id = tt.id
            ${this.where(conditions)}
            ORDER BY sr.created_at DESC, sr.id DESC
        `;
        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }
        const result = await this.db.query(query, values);
        return result.rows;
    }

    // ============================================================
    // OVERVIEW
    // ============================================================
    async overview(filter: ReportFilter): Promise<any> {
        const teacherConditions: string[] = [];
        const teacherValues: unknown[] = [];
        this.pushDateRange('attendance_date', filter, teacherConditions, teacherValues);
        if (filter.branch_id) {
            teacherConditions.push('branch_id = ?');
            teacherValues.push(filter.branch_id);
        }

        const studentConditions: string[] = [];
        const studentValues: unknown[] = [];
        this.pushDateRange('cs.scheduled_date', filter, studentConditions, studentValues);
        if (filter.branch_id) {
            studentConditions.push('sp.branch_id = ?');
            studentValues.push(filter.branch_id);
        }

        const sessionConditions: string[] = [];
        const sessionValues: unknown[] = [];
        this.pushDateRange('cs.scheduled_date', filter, sessionConditions, sessionValues);
        if (filter.branch_id) {
            sessionConditions.push('c.branch_id = ?');
            sessionValues.push(filter.branch_id);
        }

        const rescheduleConditions: string[] = [];
        const rescheduleValues: unknown[] = [];
        this.pushDateRange('DATE(sr.created_at)', filter, rescheduleConditions, rescheduleValues);
        if (filter.branch_id) {
            rescheduleConditions.push('c.branch_id = ?');
            rescheduleValues.push(filter.branch_id);
        }

        const [teacherRows, studentRows, sessionRows, rescheduleRows] = await Promise.all([
            this.db.query(
                `SELECT status, COUNT(*) AS count,
                        COALESCE(SUM(TIMESTAMPDIFF(MINUTE, check_in_at, check_out_at)), 0) AS minutes
                 FROM teacher_attendances ${this.where(teacherConditions)}
                 GROUP BY status`,
                teacherValues,
            ),
            this.db.query(
                `SELECT css.attendance_status AS status, COUNT(*) AS count
                 FROM class_session_students css
                 JOIN class_sessions cs ON css.session_id = cs.id
                 JOIN student_programs sp ON css.student_program_id = sp.id
                 ${this.where(studentConditions)}
                 GROUP BY css.attendance_status`,
                studentValues,
            ),
            this.db.query(
                `SELECT cs.status, COUNT(*) AS count
                 FROM class_sessions cs
                 JOIN classes c ON cs.class_id = c.id
                 ${this.where(sessionConditions)}
                 GROUP BY cs.status`,
                sessionValues,
            ),
            this.db.query(
                `SELECT sr.type, COUNT(*) AS count
                 FROM session_reschedules sr
                 LEFT JOIN classes c ON sr.class_id = c.id
                 ${this.where(rescheduleConditions)}
                 GROUP BY sr.type`,
                rescheduleValues,
            ),
        ]);

        return {
            teacher_attendance: teacherRows.rows,
            student_attendance: studentRows.rows,
            sessions: sessionRows.rows,
            reschedules: rescheduleRows.rows,
        };
    }
}
