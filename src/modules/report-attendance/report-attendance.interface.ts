import type { Request, Response, NextFunction } from 'express';

export interface IReportAttendanceRepository {
    report_attendance_by_branch_id(branch_id: number, month?: string): Promise<any>;
    report_attendance_by_teacher_id(teacher_id: number, month?: string): Promise<any>;
}

export interface IReportAttendanceService {
    report_attendance_by_branch_id(branch_id: number, month?: string): Promise<any>;
    report_attendance_by_teacher_id(teacher_id: number, month?: string): Promise<any>;
}

export interface IReportAttendanceController {
    report_attendance_by_branch_id(req: Request, res: Response, next: NextFunction): Promise<void>;
    report_attendance_by_teacher_id(req: Request, res: Response, next: NextFunction): Promise<void>;
}
