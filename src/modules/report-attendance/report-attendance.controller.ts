import type { Request, Response, NextFunction } from 'express';
import type {
    IReportAttendanceController,
    IReportAttendanceService,
} from './report-attendance.interface';

export class ReportAttendanceController implements IReportAttendanceController {
    constructor(private readonly service: IReportAttendanceService) {}

    report_attendance_by_branch_id = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { branch_id } = req.params;
            const { month } = req.query;
            const data = await this.service.report_attendance_by_branch_id(
                Number(branch_id),
                month as string,
            );
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    report_attendance_by_teacher_id = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { teacher_id } = req.params;
            const { month } = req.query;
            const data = await this.service.report_attendance_by_teacher_id(
                Number(teacher_id),
                month as string,
            );
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };
}
