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
}
