import type { IDashboardRepository, IDashboardService } from './dashboard.interface';

const STUDENT_PROGRAM_STATUSES = [
    'PENDING',
    'TRIAL',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
    'EXPIRED',
] as const;

const STUDENT_ATTENDANCE_STATUSES = [
    'PRESENT',
    'ABSENT',
    'SICK',
    'PERMISSION',
    'RESCHEDULED',
] as const;

const TEACHER_ATTENDANCE_STATUSES = [
    'PRESENT',
    'ABSENT',
    'SICK',
    'LEAVE',
    'REMOTE',
    'OFFICIAL_DUTY',
    'HOLIDAY',
    'LATE',
] as const;

const num = (value: unknown): number => Number(value ?? 0);

const monthKey = (date: Date): string =>
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const monthLabel = (key: string): string => {
    const [year, month] = key.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('id-ID', {
        month: 'short',
        year: 'numeric',
    });
};

export class DashboardService implements IDashboardService {
    constructor(private readonly repository: IDashboardRepository) {}

    async get_total_branch(): Promise<any> {
        return await this.repository.get_total_branch();
    }

    async get_total_teacher(): Promise<any> {
        return await this.repository.get_total_teacher();
    }

    async get_total_program(): Promise<any> {
        return await this.repository.get_total_program();
    }

    async get_total_role(): Promise<any> {
        return await this.repository.get_total_role();
    }

    async get_total_menu(): Promise<any> {
        return await this.repository.get_total_menu();
    }

    async get_total_user(): Promise<any> {
        return await this.repository.get_total_user();
    }

    async getOverview(): Promise<any> {
        const trendMonths = 12;
        const attendanceDays = 30;
        const [
            kpisRaw,
            programStatusRows,
            trendRows,
            sessionRaw,
            studentAttendanceRows,
            teacherAttendanceRows,
            checkedInToday,
            branchRows,
            topProgramRows,
            upcomingSessions,
            recentEnrollments,
            leaderboardRows,
            attentionRaw,
        ] = await Promise.all([
            this.repository.get_kpis(),
            this.repository.get_student_program_status(),
            this.repository.get_enrollment_trend(trendMonths),
            this.repository.get_session_stats(),
            this.repository.get_student_attendance_stats(attendanceDays),
            this.repository.get_teacher_attendance_today(),
            this.repository.get_teacher_checked_in_today(),
            this.repository.get_branch_performance(),
            this.repository.get_top_programs(5),
            this.repository.get_upcoming_sessions(8),
            this.repository.get_recent_enrollments(8),
            this.repository.get_teacher_leaderboard(5),
            this.repository.get_attention_counts(),
        ]);

        // ---------- enrollment by status ----------
        const byStatus: Record<string, number> = {};
        for (const status of STUDENT_PROGRAM_STATUSES) byStatus[status] = 0;
        let enrollmentTotal = 0;
        for (const row of programStatusRows) {
            const count = num(row.count);
            byStatus[row.status] = count;
            enrollmentTotal += count;
        }

        // ---------- enrollment trend (fill missing months) ----------
        const trendMap = new Map<string, number>();
        for (const row of trendRows) trendMap.set(row.month, num(row.count));

        const trend: { month: string; label: string; count: number }[] = [];
        const now = new Date();
        for (let offset = trendMonths - 1; offset >= 0; offset -= 1) {
            const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
            const key = monthKey(date);
            trend.push({ month: key, label: monthLabel(key), count: trendMap.get(key) ?? 0 });
        }
        const trendThisMonth = trend[trend.length - 1]?.count ?? 0;
        const trendLastMonth = trend[trend.length - 2]?.count ?? 0;

        // ---------- student attendance ----------
        const attendanceByStatus: Record<string, number> = {};
        for (const status of STUDENT_ATTENDANCE_STATUSES) attendanceByStatus[status] = 0;
        let attendanceTotal = 0;
        let attendancePresent = 0;
        for (const row of studentAttendanceRows) {
            const count = num(row.count);
            attendanceByStatus[row.status] = count;
            attendanceTotal += count;
            if (row.status === 'PRESENT') attendancePresent += count;
        }
        const attendanceRate =
            attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 1000) / 10 : 0;

        // ---------- teacher attendance today ----------
        const teacherAttendance: Record<string, number> = {};
        for (const status of TEACHER_ATTENDANCE_STATUSES) teacherAttendance[status] = 0;
        for (const row of teacherAttendanceRows) {
            teacherAttendance[row.status] = num(row.count);
        }
        const teachersActive = num(kpisRaw?.teachers_active);
        const teacherNotCheckedIn = Math.max(teachersActive - checkedInToday, 0);

        // ---------- sessions ----------
        const sessions = {
            today: num(sessionRaw?.today),
            this_week: num(sessionRaw?.this_week),
            upcoming: num(sessionRaw?.upcoming),
            completed_this_month: num(sessionRaw?.completed_this_month),
            cancelled_this_month: num(sessionRaw?.cancelled_this_month),
            total: num(sessionRaw?.total),
        };

        // ---------- attention / alerts ----------
        const attention: {
            code: string;
            severity: 'info' | 'warning' | 'danger';
            title: string;
            count: number;
            description: string;
        }[] = [];

        const pushAttention = (
            code: string,
            severity: 'info' | 'warning' | 'danger',
            title: string,
            count: number,
            description: string,
        ) => {
            if (count > 0) attention.push({ code, severity, title, count, description });
        };

        pushAttention(
            'CLASS_WITHOUT_TEACHER',
            'danger',
            'Kelas tanpa guru utama',
            num(attentionRaw?.classes_without_teacher),
            'Belum ada guru utama aktif yang ditugaskan pada kelas ini.',
        );
        pushAttention(
            'CLASS_WITHOUT_STUDENTS',
            'warning',
            'Kelas tanpa siswa aktif',
            num(attentionRaw?.classes_without_students),
            'Kelas ini belum memiliki siswa aktif yang terdaftar.',
        );
        pushAttention(
            'PENDING_ENROLLMENT',
            'warning',
            'Pendaftaran menunggu tindak lanjut',
            num(attentionRaw?.pending_enrollments),
            'Pendaftaran berstatus PENDING atau TRIAL belum diaktifkan.',
        );
        pushAttention(
            'INACTIVE_TEACHER',
            'info',
            'Guru tidak aktif',
            num(attentionRaw?.inactive_teachers),
            'Guru dengan status tidak aktif bekerja.',
        );

        return {
            generated_at: new Date().toISOString(),
            kpis: {
                students_total: num(kpisRaw?.students_total),
                students_active: num(kpisRaw?.students_active),
                teachers_total: num(kpisRaw?.teachers_total),
                teachers_active: teachersActive,
                classes_total: num(kpisRaw?.classes_total),
                classes_active: num(kpisRaw?.classes_active),
                branches_total: num(kpisRaw?.branches_total),
                programs_active: num(kpisRaw?.programs_active),
                packages_active: num(kpisRaw?.packages_active),
                users_total: num(kpisRaw?.users_total),
                new_enrollments_this_month: num(kpisRaw?.new_enrollments_this_month),
            },
            enrollment: {
                total: enrollmentTotal,
                this_month: trendThisMonth,
                last_month: trendLastMonth,
                by_status: byStatus,
                trend,
            },
            sessions,
            attendance: {
                period_days: attendanceDays,
                student: {
                    ...attendanceByStatus,
                    total: attendanceTotal,
                    rate: attendanceRate,
                },
                teacher_today: {
                    ...teacherAttendance,
                    checked_in: checkedInToday,
                    not_checked_in: teacherNotCheckedIn,
                    total_active: teachersActive,
                },
            },
            branches: branchRows.map((row) => ({
                id: row.id,
                name: row.name,
                students: num(row.students),
                teachers: num(row.teachers),
                classes: num(row.classes),
                sessions_this_month: num(row.sessions_this_month),
                revenue: num(row.revenue),
            })),
            top_programs: topProgramRows.map((row) => ({
                id: row.id,
                name: row.name,
                students: num(row.students),
                revenue: num(row.revenue),
            })),
            upcoming_sessions: upcomingSessions.map((row) => ({
                id: row.id,
                scheduled_date: row.scheduled_date,
                start_time: row.start_time,
                end_time: row.end_time,
                status: row.status,
                class_name: row.class_name,
                class_code: row.class_code,
                teacher_name: row.teacher_name,
                branch_name: row.branch_name,
                participant_count: num(row.participant_count),
            })),
            recent_enrollments: recentEnrollments.map((row) => ({
                id: row.id,
                status: row.status,
                created_at: row.created_at,
                selling_price: num(row.selling_price),
                student_name: row.student_name,
                package_name: row.package_name,
                program_name: row.program_name,
                level_name: row.level_name,
                branch_name: row.branch_name,
            })),
            teacher_leaderboard: leaderboardRows.map((row) => ({
                id: row.id,
                name: row.name,
                total_sessions: num(row.total_sessions),
                completed_sessions: num(row.completed_sessions),
            })),
            attention,
        };
    }
}
