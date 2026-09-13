import type { DatabaseClient } from '../../config/database/types';
import type { IReportAttendanceRepository } from './report-attendance.interface';

export class ReportAttendanceRepository implements IReportAttendanceRepository {
    constructor(private readonly db: DatabaseClient) {}

    private async getAttendanceData(
        whereClause: string,
        params: any[],
        month?: string,
    ): Promise<any> {
        let dateFilter = '';
        if (month) {
            dateFilter = 'AND DATE_FORMAT(ta.attendance_date, "%Y-%m") = ?';
            params.push(month);
        }

        const dataQuery = `
            SELECT ta.*, t.full_name as teacher_name, b.name as branch_name
            FROM teacher_attendances ta
            LEFT JOIN teachers t ON ta.teacher_id = t.id
            LEFT JOIN branches b ON ta.branch_id = b.id
            WHERE ${whereClause} ${dateFilter};
        `;

        const statsQuery = `
            SELECT status, COUNT(*) as count
            FROM teacher_attendances ta
            WHERE ${whereClause} ${dateFilter}
            GROUP BY status;
        `;

        const [dataResult, statsResult] = await Promise.all([
            this.db.query(dataQuery, params),
            this.db.query(statsQuery, params),
        ]);

        const stats: Record<string, number> = {
            PRESENT: 0,
            ABSENT: 0,
            SICK: 0,
            LEAVE: 0,
            REMOTE: 0,
            OFFICIAL_DUTY: 0,
            HOLIDAY: 0,
            LATE: 0,
        };

        statsResult.rows.forEach((row: any) => {
            stats[row.status] = Number(row.count);
        });

        return { data: dataResult.rows, stats };
    }

    async report_attendance_by_branch_id(branch_id: number, month?: string): Promise<any> {
        return await this.getAttendanceData('ta.branch_id = ?', [branch_id], month);
    }

    async report_attendance_by_teacher_id(teacher_id: number, month?: string): Promise<any> {
        return await this.getAttendanceData('ta.teacher_id = ?', [teacher_id], month);
    }
}
