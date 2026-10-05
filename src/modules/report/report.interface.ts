import type { Request, Response, NextFunction } from 'express';

export interface ReportFilter {
    date_from?: string;
    date_to?: string;
    branch_id?: number;
    teacher_id?: number;
    class_id?: number;
    status?: string;
    type?: 'SESSION' | 'TEACHER' | 'STUDENT';
    page?: number;
    limit?: number;
}

export interface IReportRepository {
    teacherAttendance(filter: ReportFilter): Promise<any[]>;
    teacherAttendanceStats(filter: ReportFilter): Promise<any[]>;
    studentAttendance(
        filter: ReportFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]>;
    studentAttendanceSummary(filter: ReportFilter): Promise<any[]>;
    sessionReport(filter: ReportFilter): Promise<any[]>;
    rescheduleReport(
        filter: ReportFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]>;
    overview(filter: ReportFilter): Promise<any>;
}

export interface IReportService {
    getTeacherAttendance(filter: ReportFilter): Promise<any>;
    getStudentAttendance(filter: ReportFilter): Promise<any>;
    getStudentAttendanceSummary(filter: ReportFilter): Promise<any>;
    getSessions(filter: ReportFilter): Promise<any>;
    getReschedules(filter: ReportFilter): Promise<any>;
    getOverview(filter: ReportFilter): Promise<any>;
    exportTeacherAttendance(filter: ReportFilter): Promise<Buffer>;
    exportStudentAttendance(filter: ReportFilter): Promise<Buffer>;
    exportSessions(filter: ReportFilter): Promise<Buffer>;
    exportReschedules(filter: ReportFilter): Promise<Buffer>;
}

export interface IReportController {
    getTeacherAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStudentAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStudentAttendanceSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReschedules(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportTeacherAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportStudentAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportReschedules(req: Request, res: Response, next: NextFunction): Promise<void>;
}
