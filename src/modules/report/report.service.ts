import ExcelJS from 'exceljs';
import type { IReportRepository, IReportService, ReportFilter } from './report.interface';

const num = (value: unknown): number => Number(value ?? 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

const TEACHER_STATUSES = [
    'PRESENT',
    'ABSENT',
    'SICK',
    'LEAVE',
    'REMOTE',
    'OFFICIAL_DUTY',
    'HOLIDAY',
    'LATE',
] as const;

const STUDENT_STATUSES = ['PRESENT', 'ABSENT', 'SICK', 'PERMISSION', 'RESCHEDULED'] as const;

const SESSION_STATUSES = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'] as const;

const RESCHEDULE_TYPES = ['SESSION', 'TEACHER', 'STUDENT'] as const;

export class ReportService implements IReportService {
    constructor(private readonly repository: IReportRepository) {}

    private withDefaults(filter: ReportFilter): ReportFilter {
        const now = new Date();
        const pad = (value: number) => String(value).padStart(2, '0');
        const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const firstDay = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
        return {
            ...filter,
            date_from: filter.date_from ?? firstDay,
            date_to: filter.date_to ?? today,
        };
    }

    private parsePagination(filter: ReportFilter): { limit: number; offset: number } {
        const limit = Math.min(Math.max(Number(filter.limit) || 50, 1), 500);
        const page = Math.max(Number(filter.page) || 1, 1);
        return { limit, offset: (page - 1) * limit };
    }

    // ============================================================
    // TEACHER ATTENDANCE
    // ============================================================
    async getTeacherAttendance(filterInput: ReportFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const [data, statsRows] = await Promise.all([
            this.repository.teacherAttendance(filter),
            this.repository.teacherAttendanceStats(filter),
        ]);

        const byStatus: Record<string, number> = {};
        for (const status of TEACHER_STATUSES) byStatus[status] = 0;

        let totalMinutes = 0;
        for (const row of statsRows) {
            byStatus[row.status] = num(row.count);
            totalMinutes += num(row.minutes);
        }

        const recordsWithDuration = data.filter((row) => num(row.duration_minutes) > 0).length;
        const total = Object.values(byStatus).reduce((sum, value) => sum + value, 0);

        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            data: data.map((row) => ({
                ...row,
                duration_minutes: num(row.duration_minutes) > 0 ? num(row.duration_minutes) : 0,
                duration_hours: round1(num(row.duration_minutes) / 60),
            })),
            stats: {
                total,
                by_status: byStatus,
                total_minutes: totalMinutes,
                total_hours: round1(totalMinutes / 60),
                average_minutes:
                    recordsWithDuration > 0 ? round1(totalMinutes / recordsWithDuration) : 0,
            },
        };
    }

    // ============================================================
    // STUDENT ATTENDANCE
    // ============================================================
    async getStudentAttendance(filterInput: ReportFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const pagination = this.parsePagination(filter);
        const data = await this.repository.studentAttendance(filter, pagination);

        const byStatus: Record<string, number> = {};
        for (const status of STUDENT_STATUSES) byStatus[status] = 0;
        for (const row of data)
            byStatus[row.attendance_status] = num(byStatus[row.attendance_status]) + 1;

        const total = data.length;
        const present = byStatus.PRESENT;
        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            data,
            pagination: {
                limit: pagination.limit,
                offset: pagination.offset,
                page: filter.page ?? 1,
            },
            stats: {
                total,
                by_status: byStatus,
                attendance_rate: total > 0 ? round1((present / total) * 100) : 0,
            },
        };
    }

    async getStudentAttendanceSummary(filterInput: ReportFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const rows = await this.repository.studentAttendanceSummary(filter);
        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            data: rows.map((row) => {
                const total = num(row.total);
                return {
                    ...row,
                    total,
                    present: num(row.present),
                    absent: num(row.absent),
                    sick: num(row.sick),
                    permission: num(row.permission),
                    rescheduled: num(row.rescheduled),
                    rate: total > 0 ? round1((num(row.present) / total) * 100) : 0,
                };
            }),
        };
    }

    // ============================================================
    // SESSIONS
    // ============================================================
    async getSessions(filterInput: ReportFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const rows = await this.repository.sessionReport(filter);

        const byStatus: Record<string, number> = {};
        for (const status of SESSION_STATUSES) byStatus[status] = 0;

        let participants = 0;
        let present = 0;
        let absent = 0;
        for (const row of rows) {
            byStatus[row.status] = num(byStatus[row.status]) + 1;
            participants += num(row.participant_count);
            present += num(row.present);
            absent += num(row.absent);
        }

        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            data: rows.map((row) => ({
                ...row,
                participant_count: num(row.participant_count),
                present: num(row.present),
                absent: num(row.absent),
                sick: num(row.sick),
                permission: num(row.permission),
                rescheduled: num(row.rescheduled),
                attendance_rate:
                    num(row.participant_count) > 0
                        ? round1((num(row.present) / num(row.participant_count)) * 100)
                        : 0,
            })),
            stats: {
                total: rows.length,
                by_status: byStatus,
                participants,
                present,
                absent,
                attendance_rate: participants > 0 ? round1((present / participants) * 100) : 0,
            },
        };
    }

    // ============================================================
    // RESCHEDULES
    // ============================================================
    async getReschedules(filterInput: ReportFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const pagination = this.parsePagination(filter);
        const data = await this.repository.rescheduleReport(filter, pagination);

        const byType: Record<string, number> = {};
        for (const type of RESCHEDULE_TYPES) byType[type] = 0;
        for (const row of data) byType[row.type] = num(byType[row.type]) + 1;

        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            data,
            pagination: {
                limit: pagination.limit,
                offset: pagination.offset,
                page: filter.page ?? 1,
            },
            stats: { total: data.length, by_type: byType },
        };
    }

    // ============================================================
    // OVERVIEW
    // ============================================================
    async getOverview(filterInput: ReportFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const raw = await this.repository.overview(filter);

        const teacherByStatus: Record<string, number> = {};
        for (const status of TEACHER_STATUSES) teacherByStatus[status] = 0;
        let teacherMinutes = 0;
        let teacherTotal = 0;
        for (const row of raw.teacher_attendance) {
            teacherByStatus[row.status] = num(row.count);
            teacherMinutes += num(row.minutes);
            teacherTotal += num(row.count);
        }

        const studentByStatus: Record<string, number> = {};
        for (const status of STUDENT_STATUSES) studentByStatus[status] = 0;
        let studentTotal = 0;
        for (const row of raw.student_attendance) {
            studentByStatus[row.status] = num(row.count);
            studentTotal += num(row.count);
        }

        const sessionByStatus: Record<string, number> = {};
        for (const status of SESSION_STATUSES) sessionByStatus[status] = 0;
        let sessionTotal = 0;
        for (const row of raw.sessions) {
            sessionByStatus[row.status] = num(row.count);
            sessionTotal += num(row.count);
        }

        const rescheduleByType: Record<string, number> = {};
        for (const type of RESCHEDULE_TYPES) rescheduleByType[type] = 0;
        let rescheduleTotal = 0;
        for (const row of raw.reschedules) {
            rescheduleByType[row.type] = num(row.count);
            rescheduleTotal += num(row.count);
        }

        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            kpis: {
                teacher_attendance_total: teacherTotal,
                teacher_total_hours: round1(teacherMinutes / 60),
                student_attendance_total: studentTotal,
                student_attendance_rate:
                    studentTotal > 0 ? round1((studentByStatus.PRESENT / studentTotal) * 100) : 0,
                sessions_total: sessionTotal,
                sessions_completed: sessionByStatus.COMPLETED,
                sessions_cancelled: sessionByStatus.CANCELLED,
                reschedules_total: rescheduleTotal,
            },
            teacher_attendance: { by_status: teacherByStatus, total: teacherTotal },
            student_attendance: { by_status: studentByStatus, total: studentTotal },
            sessions: { by_status: sessionByStatus, total: sessionTotal },
            reschedules: { by_type: rescheduleByType, total: rescheduleTotal },
        };
    }

    // ============================================================
    // EXCEL EXPORT
    // ============================================================
    private styleHeader(sheet: ExcelJS.Worksheet): void {
        const header = sheet.getRow(1);
        header.font = { bold: true };
        header.alignment = { vertical: 'middle' };
    }

    async exportTeacherAttendance(filter: ReportFilter): Promise<Buffer> {
        const report = await this.getTeacherAttendance(filter);
        const workbook = new ExcelJS.Workbook();

        const sheet = workbook.addWorksheet('Absensi Guru');
        sheet.columns = [
            { header: 'Tanggal', key: 'attendance_date', width: 14 },
            { header: 'Guru', key: 'teacher_name', width: 28 },
            { header: 'Cabang', key: 'branch_name', width: 22 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Datang', key: 'check_in_at', width: 20 },
            { header: 'Keluar', key: 'check_out_at', width: 20 },
            { header: 'Durasi (menit)', key: 'duration_minutes', width: 16 },
            { header: 'Durasi (jam)', key: 'duration_hours', width: 14 },
            { header: 'Catatan', key: 'notes', width: 30 },
        ];
        sheet.addRows(report.data);
        this.styleHeader(sheet);

        const statsSheet = workbook.addWorksheet('Ringkasan');
        statsSheet.columns = [
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Jumlah', key: 'count', width: 14 },
        ];
        Object.entries(report.stats.by_status).forEach(([status, count]) =>
            statsSheet.addRow({ status, count }),
        );
        statsSheet.addRow({ status: 'Total Jam Kerja', count: report.stats.total_hours });
        statsSheet.addRow({
            status: 'Rata-rata Durasi (menit)',
            count: report.stats.average_minutes,
        });
        this.styleHeader(statsSheet);

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    async exportStudentAttendance(filter: ReportFilter): Promise<Buffer> {
        const [detail, summary] = await Promise.all([
            this.getStudentAttendance({ ...filter, page: 1, limit: 500 }),
            this.getStudentAttendanceSummary(filter),
        ]);
        const workbook = new ExcelJS.Workbook();

        const summarySheet = workbook.addWorksheet('Rekap Siswa');
        summarySheet.columns = [
            { header: 'Siswa', key: 'student_name', width: 28 },
            { header: 'Cabang', key: 'branch_name', width: 22 },
            { header: 'Total', key: 'total', width: 10 },
            { header: 'Hadir', key: 'present', width: 10 },
            { header: 'Alfa', key: 'absent', width: 10 },
            { header: 'Sakit', key: 'sick', width: 10 },
            { header: 'Izin', key: 'permission', width: 10 },
            { header: 'Reschedule', key: 'rescheduled', width: 12 },
            { header: 'Kehadiran (%)', key: 'rate', width: 15 },
        ];
        summarySheet.addRows(summary.data);
        this.styleHeader(summarySheet);

        const sheet = workbook.addWorksheet('Detail Absensi');
        sheet.columns = [
            { header: 'Tanggal', key: 'scheduled_date', width: 14 },
            { header: 'Kelas', key: 'class_name', width: 24 },
            { header: 'Siswa', key: 'student_name', width: 28 },
            { header: 'Guru', key: 'teacher_name', width: 24 },
            { header: 'Cabang', key: 'branch_name', width: 20 },
            { header: 'Status', key: 'attendance_status', width: 14 },
            { header: 'Catatan', key: 'notes', width: 30 },
        ];
        sheet.addRows(detail.data);
        this.styleHeader(sheet);

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    async exportSessions(filter: ReportFilter): Promise<Buffer> {
        const report = await this.getSessions(filter);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Sesi');
        sheet.columns = [
            { header: 'Tanggal', key: 'scheduled_date', width: 14 },
            { header: 'Kelas', key: 'class_name', width: 24 },
            { header: 'Guru', key: 'teacher_name', width: 24 },
            { header: 'Cabang', key: 'branch_name', width: 20 },
            { header: 'Mulai', key: 'start_time', width: 10 },
            { header: 'Selesai', key: 'end_time', width: 10 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Peserta', key: 'participant_count', width: 10 },
            { header: 'Hadir', key: 'present', width: 10 },
            { header: 'Alfa', key: 'absent', width: 10 },
            { header: 'Kehadiran (%)', key: 'attendance_rate', width: 15 },
        ];
        sheet.addRows(report.data);
        this.styleHeader(sheet);
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    async exportReschedules(filter: ReportFilter): Promise<Buffer> {
        const report = await this.getReschedules({ ...filter, page: 1, limit: 500 });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Reschedule');
        sheet.columns = [
            { header: 'Jenis', key: 'type', width: 12 },
            { header: 'Kelas', key: 'class_name', width: 24 },
            { header: 'Siswa', key: 'student_name', width: 24 },
            { header: 'Guru Asal', key: 'from_teacher_name', width: 24 },
            { header: 'Guru Pengganti', key: 'to_teacher_name', width: 24 },
            { header: 'Dari', key: 'from_date', width: 14 },
            { header: 'Ke', key: 'to_date', width: 14 },
            { header: 'Alasan', key: 'reason', width: 30 },
            { header: 'Dicatat', key: 'created_at', width: 20 },
        ];
        sheet.addRows(report.data);
        this.styleHeader(sheet);
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
}
