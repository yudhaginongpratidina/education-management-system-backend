import type { Request, Response, NextFunction } from 'express';
import type { IReportController, IReportService } from './report.interface';

export class ReportController implements IReportController {
    constructor(private readonly service: IReportService) {}

    private filter(req: Request): any {
        return req.query;
    }

    private sendExcel(res: Response, buffer: Buffer, filename: string): void {
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);
    }

    getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getOverview(this.filter(req));
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    getTeacherAttendance = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const data = await this.service.getTeacherAttendance(this.filter(req));
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    getStudentAttendance = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const data = await this.service.getStudentAttendance(this.filter(req));
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    getStudentAttendanceSummary = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const data = await this.service.getStudentAttendanceSummary(this.filter(req));
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getSessions(this.filter(req));
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    getReschedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getReschedules(this.filter(req));
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    exportTeacherAttendance = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const buffer = await this.service.exportTeacherAttendance(this.filter(req));
            this.sendExcel(res, buffer, 'laporan-absensi-guru.xlsx');
        } catch (error) {
            next(error);
        }
    };

    exportStudentAttendance = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const buffer = await this.service.exportStudentAttendance(this.filter(req));
            this.sendExcel(res, buffer, 'laporan-absensi-siswa.xlsx');
        } catch (error) {
            next(error);
        }
    };

    exportSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const buffer = await this.service.exportSessions(this.filter(req));
            this.sendExcel(res, buffer, 'laporan-sesi.xlsx');
        } catch (error) {
            next(error);
        }
    };

    exportReschedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const buffer = await this.service.exportReschedules(this.filter(req));
            this.sendExcel(res, buffer, 'laporan-reschedule.xlsx');
        } catch (error) {
            next(error);
        }
    };
}
