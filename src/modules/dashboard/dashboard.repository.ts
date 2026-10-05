import type { DatabaseClient } from '../../config/database/types';
import type { IDashboardRepository } from './dashboard.interface';

export class DashboardRepository implements IDashboardRepository {
    constructor(private readonly db: DatabaseClient) {}

    async get_total_branch(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM branches;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_teacher(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM teachers;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_program(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM programs;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_role(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM roles;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_menu(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM menus;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    async get_total_user(): Promise<any> {
        const query = `SELECT COUNT(*) as total FROM users;`;
        const result = await this.db.query(query);
        return result.rows[0].total;
    }

    // ============================================================
    // RICH OVERVIEW
    // ============================================================
    async get_kpis(): Promise<any> {
        const query = `
            SELECT
                (SELECT COUNT(*) FROM students) AS students_total,
                (SELECT COUNT(*) FROM student_programs WHERE status = 'ACTIVE') AS students_active,
                (SELECT COUNT(*) FROM teachers) AS teachers_total,
                (SELECT COUNT(*) FROM teachers WHERE still_actively_working = TRUE) AS teachers_active,
                (SELECT COUNT(*) FROM classes) AS classes_total,
                (SELECT COUNT(*) FROM classes WHERE status = 'ACTIVE') AS classes_active,
                (SELECT COUNT(*) FROM branches) AS branches_total,
                (SELECT COUNT(*) FROM programs WHERE status = 'ACTIVE') AS programs_active,
                (SELECT COUNT(*) FROM program_packages WHERE status = 'ACTIVE') AS packages_active,
                (SELECT COUNT(*) FROM users) AS users_total,
                (
                    SELECT COUNT(*) FROM student_programs
                    WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                ) AS new_enrollments_this_month
        `;
        const result = await this.db.query(query);
        return result.rows[0];
    }

    async get_student_program_status(): Promise<any[]> {
        const result = await this.db.query(`
            SELECT status, COUNT(*) AS count
            FROM student_programs
            GROUP BY status
        `);
        return result.rows;
    }

    async get_enrollment_trend(months: number): Promise<any[]> {
        const safeMonths = Math.max(1, Math.floor(months));
        const result = await this.db.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
            FROM student_programs
            WHERE created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL ${safeMonths - 1} MONTH)
            GROUP BY month
            ORDER BY month ASC
        `);
        return result.rows;
    }

    async get_session_stats(): Promise<any> {
        const query = `
            SELECT
                (
                    SELECT COUNT(*) FROM class_sessions
                    WHERE scheduled_date = CURDATE()
                      AND status NOT IN ('CANCELLED', 'RESCHEDULED')
                ) AS today,
                (
                    SELECT COUNT(*) FROM class_sessions
                    WHERE scheduled_date BETWEEN
                        DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                        AND DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 6 DAY)
                ) AS this_week,
                (
                    SELECT COUNT(*) FROM class_sessions
                    WHERE scheduled_date >= CURDATE() AND status = 'SCHEDULED'
                ) AS upcoming,
                (
                    SELECT COUNT(*) FROM class_sessions
                    WHERE status = 'COMPLETED'
                      AND scheduled_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                ) AS completed_this_month,
                (
                    SELECT COUNT(*) FROM class_sessions
                    WHERE status = 'CANCELLED'
                      AND scheduled_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                ) AS cancelled_this_month,
                (SELECT COUNT(*) FROM class_sessions) AS total
        `;
        const result = await this.db.query(query);
        return result.rows[0];
    }

    async get_student_attendance_stats(days: number): Promise<any[]> {
        const safeDays = Math.max(1, Math.floor(days));
        const result = await this.db.query(`
            SELECT css.attendance_status AS status, COUNT(*) AS count
            FROM class_session_students css
            JOIN class_sessions cs ON css.session_id = cs.id
            WHERE cs.scheduled_date >= DATE_SUB(CURDATE(), INTERVAL ${safeDays} DAY)
            GROUP BY css.attendance_status
        `);
        return result.rows;
    }

    async get_teacher_attendance_today(): Promise<any[]> {
        const result = await this.db.query(`
            SELECT status, COUNT(DISTINCT teacher_id) AS count
            FROM teacher_attendances
            WHERE attendance_date = CURDATE()
            GROUP BY status
        `);
        return result.rows;
    }

    async get_teacher_checked_in_today(): Promise<number> {
        const result = await this.db.query(`
            SELECT COUNT(DISTINCT teacher_id) AS total
            FROM teacher_attendances
            WHERE attendance_date = CURDATE()
        `);
        return Number(result.rows[0]?.total ?? 0);
    }

    async get_branch_performance(): Promise<any[]> {
        const result = await this.db.query(`
            SELECT
                b.id,
                b.name,
                (
                    SELECT COUNT(*) FROM student_programs sp
                    WHERE sp.branch_id = b.id AND sp.status = 'ACTIVE'
                ) AS students,
                (
                    SELECT COUNT(DISTINCT tb.teacher_id) FROM teacher_branches tb
                    WHERE tb.branch_id = b.id
                ) AS teachers,
                (
                    SELECT COUNT(*) FROM classes c
                    WHERE c.branch_id = b.id
                ) AS classes,
                (
                    SELECT COUNT(*) FROM class_sessions cs
                    JOIN classes c2 ON cs.class_id = c2.id
                    WHERE c2.branch_id = b.id
                      AND cs.scheduled_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                ) AS sessions_this_month,
                (
                    SELECT COALESCE(SUM(sp.selling_price), 0) FROM student_programs sp
                    WHERE sp.branch_id = b.id AND sp.status = 'ACTIVE'
                ) AS revenue
            FROM branches b
            ORDER BY students DESC, b.name ASC
        `);
        return result.rows;
    }

    async get_top_programs(limit: number): Promise<any[]> {
        const safeLimit = Math.max(1, Math.floor(limit));
        const result = await this.db.query(`
            SELECT
                p.id,
                p.name,
                COUNT(sp.id) AS students,
                COALESCE(SUM(sp.selling_price), 0) AS revenue
            FROM programs p
            LEFT JOIN program_packages pp ON pp.program_id = p.id
            LEFT JOIN student_programs sp
                ON sp.program_package_id = pp.id AND sp.status = 'ACTIVE'
            GROUP BY p.id, p.name
            ORDER BY students DESC, revenue DESC, p.name ASC
            LIMIT ${safeLimit}
        `);
        return result.rows;
    }

    async get_upcoming_sessions(limit: number): Promise<any[]> {
        const safeLimit = Math.max(1, Math.floor(limit));
        const result = await this.db.query(`
            SELECT
                cs.id,
                cs.scheduled_date,
                cs.start_time,
                cs.end_time,
                cs.status,
                c.name AS class_name,
                c.code AS class_code,
                t.full_name AS teacher_name,
                b.name AS branch_name,
                (
                    SELECT COUNT(*) FROM class_session_students x
                    WHERE x.session_id = cs.id
                ) AS participant_count
            FROM class_sessions cs
            JOIN classes c ON cs.class_id = c.id
            LEFT JOIN teachers t ON cs.teacher_id = t.id
            LEFT JOIN branches b ON c.branch_id = b.id
            WHERE cs.scheduled_date >= CURDATE()
              AND cs.status = 'SCHEDULED'
            ORDER BY cs.scheduled_date ASC, cs.start_time ASC
            LIMIT ${safeLimit}
        `);
        return result.rows;
    }

    async get_recent_enrollments(limit: number): Promise<any[]> {
        const safeLimit = Math.max(1, Math.floor(limit));
        const result = await this.db.query(`
            SELECT
                sp.id,
                sp.status,
                sp.created_at,
                sp.selling_price,
                s.full_name AS student_name,
                pp.name AS package_name,
                p.name AS program_name,
                pl.name AS level_name,
                b.name AS branch_name
            FROM student_programs sp
            JOIN students s ON sp.student_id = s.id
            LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
            LEFT JOIN programs p ON pp.program_id = p.id
            LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
            LEFT JOIN branches b ON sp.branch_id = b.id
            ORDER BY sp.created_at DESC, sp.id DESC
            LIMIT ${safeLimit}
        `);
        return result.rows;
    }

    async get_teacher_leaderboard(limit: number): Promise<any[]> {
        const safeLimit = Math.max(1, Math.floor(limit));
        const result = await this.db.query(`
            SELECT
                t.id,
                t.full_name AS name,
                COUNT(cs.id) AS total_sessions,
                SUM(CASE WHEN cs.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_sessions
            FROM teachers t
            JOIN class_sessions cs ON cs.teacher_id = t.id
            WHERE cs.scheduled_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            GROUP BY t.id, t.full_name
            ORDER BY completed_sessions DESC, total_sessions DESC, t.full_name ASC
            LIMIT ${safeLimit}
        `);
        return result.rows;
    }

    async get_attention_counts(): Promise<any> {
        const result = await this.db.query(`
            SELECT
                (
                    SELECT COUNT(*) FROM classes c
                    WHERE NOT EXISTS (
                        SELECT 1 FROM class_teachers ct
                        WHERE ct.class_id = c.id
                          AND ct.role = 'PRIMARY'
                          AND ct.started_at <= CURDATE()
                          AND (ct.ended_at IS NULL OR ct.ended_at >= CURDATE())
                    )
                ) AS classes_without_teacher,
                (
                    SELECT COUNT(*) FROM classes c
                    WHERE NOT EXISTS (
                        SELECT 1 FROM class_students cs
                        WHERE cs.class_id = c.id AND cs.left_at IS NULL
                    )
                ) AS classes_without_students,
                (
                    SELECT COUNT(*) FROM student_programs
                    WHERE status IN ('PENDING', 'TRIAL')
                ) AS pending_enrollments,
                (
                    SELECT COUNT(*) FROM teachers
                    WHERE still_actively_working = FALSE
                ) AS inactive_teachers
        `);
        return result.rows[0];
    }
}
