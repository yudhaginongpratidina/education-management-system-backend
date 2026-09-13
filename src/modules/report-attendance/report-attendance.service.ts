import ExcelJS from 'exceljs';
import type {
    IReportAttendanceRepository,
    IReportAttendanceService,
} from './report-attendance.interface';

export class ReportAttendanceService implements IReportAttendanceService {
    constructor(private readonly repo: IReportAttendanceRepository) {}

    async report_attendance_by_branch_id(branch_id: number, month?: string): Promise<any> {
        return await this.repo.report_attendance_by_branch_id(branch_id, month);
    }

    async report_attendance_by_teacher_id(teacher_id: number, month?: string): Promise<any> {
        return await this.repo.report_attendance_by_teacher_id(teacher_id, month);
    }

    private async generateExcel(data: any[], stats: any): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();

        // 1. Details Sheet
        const worksheet = workbook.addWorksheet('Attendance Details');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Teacher', key: 'teacher_name', width: 30 },
            { header: 'Branch', key: 'branch_name', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Date', key: 'attendance_date', width: 20 },
            { header: 'Check In', key: 'check_in_at', width: 20 },
            { header: 'Check Out', key: 'check_out_at', width: 20 },
            { header: 'Duration (Minutes)', key: 'duration', width: 20 },
            { header: 'Notes', key: 'notes', width: 30 },
        ];

        const formattedData = data.map((row) => {
            let duration = 0;
            if (row.check_in_at && row.check_out_at) {
                const start = new Date(row.check_in_at).getTime();
                const end = new Date(row.check_out_at).getTime();
                duration = Math.round((end - start) / (1000 * 60));
            }
            return {
                ...row,
                duration: duration > 0 ? duration : null,
            };
        });

        worksheet.addRows(formattedData);

        // 2. Stats Sheet
        const statsSheet = workbook.addWorksheet('Statistics');
        statsSheet.columns = [
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Count', key: 'count', width: 15 },
        ];

        Object.entries(stats).forEach(([status, count]) => {
            statsSheet.addRow({ status, count });
        });

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    async export_report_attendance_by_branch_id(
        branch_id: number,
        month?: string,
    ): Promise<Buffer> {
        const { data, stats } = await this.repo.report_attendance_by_branch_id(branch_id, month);
        return await this.generateExcel(data, stats);
    }

    async export_report_attendance_by_teacher_id(
        teacher_id: number,
        month?: string,
    ): Promise<Buffer> {
        const { data, stats } = await this.repo.report_attendance_by_teacher_id(teacher_id, month);
        return await this.generateExcel(data, stats);
    }
}
