import type { Request, Response, NextFunction } from 'express';
import type {
    IClassSessionService,
    IClassSessionStudentService,
    ISessionController,
    ISessionGenerationService,
} from './class-session.interface';

const parsePagination = (query: any): { limit: number; offset: number } | undefined => {
    if (!query.limit || !query.page) return undefined;
    const limit = parseInt(query.limit, 10);
    const page = parseInt(query.page, 10);
    if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) return undefined;
    return { limit, offset: (page - 1) * limit };
};

export class SessionController implements ISessionController {
    constructor(
        private readonly service: IClassSessionService,
        private readonly sessionStudentService: IClassSessionStudentService,
        private readonly generationService: ISessionGenerationService,
    ) {}

    private queryFilter(query: any): any {
        const filter: any = { ...query };
        delete filter.limit;
        delete filter.page;
        return filter;
    }

    // ---------- sessions (nested under a class) ----------
    getClassSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getClassSessions(
                Number(req.params.classId),
                this.queryFilter(req.query),
            );
            res.status(200).json({
                success: true,
                message: 'Class sessions fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    createClassSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.createClassSession(
                Number(req.params.classId),
                req.body,
            );
            res.status(201).json({ success: true, message: 'Session created', data: response });
        } catch (error) {
            next(error);
        }
    };

    // ---------- sessions (global) ----------
    getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getSessions(
                this.queryFilter(req.query),
                parsePagination(req.query),
            );
            res.status(200).json({ success: true, message: 'Sessions fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getSessionById(Number(req.params.id));
            res.status(200).json({ success: true, message: 'Session fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    updateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.updateSession(Number(req.params.id), req.body);
            res.status(200).json({ success: true, message: 'Session updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.deleteSession(Number(req.params.id));
            res.status(200).json({ success: true, message: 'Session deleted' });
        } catch (error) {
            next(error);
        }
    };

    rescheduleSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.rescheduleSession(Number(req.params.id), req.body);
            res.status(200).json({ success: true, message: 'Session rescheduled', data: response });
        } catch (error) {
            next(error);
        }
    };

    substituteTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.substituteTeacher(Number(req.params.id), req.body);
            res.status(200).json({
                success: true,
                message: 'Substitute teacher assigned',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    generateSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.generationService.generateForClass(
                Number(req.params.classId),
                req.body.from,
                req.body.to,
            );
            res.status(201).json({
                success: true,
                message: 'Sessions generated',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    getCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getCalendar(this.queryFilter(req.query));
            res.status(200).json({ success: true, message: 'Calendar fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    // ---------- session students ----------
    getSessionStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.sessionStudentService.getSessionStudents(
                Number(req.params.sessionId),
            );
            res.status(200).json({
                success: true,
                message: 'Session students fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    addSessionStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.sessionStudentService.addSessionStudent(
                Number(req.params.sessionId),
                req.body,
            );
            res.status(201).json({
                success: true,
                message: 'Student added to session',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    updateSessionStudent = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.sessionStudentService.updateSessionStudent(
                Number(req.params.sessionId),
                Number(req.params.studentProgramId),
                req.body,
            );
            res.status(200).json({
                success: true,
                message: 'Session student updated',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    removeSessionStudent = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.sessionStudentService.removeSessionStudent(
                Number(req.params.sessionId),
                Number(req.params.studentProgramId),
            );
            res.status(200).json({
                success: true,
                message: 'Student removed from session',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    // ---------- attendance ----------
    updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.sessionStudentService.updateAttendance(
                Number(req.params.sessionId),
                Number(req.params.studentProgramId),
                req.body,
            );
            res.status(200).json({ success: true, message: 'Attendance updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    bulkUpdateAttendance = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.sessionStudentService.bulkUpdateAttendance(
                Number(req.params.sessionId),
                req.body.records,
            );
            res.status(200).json({ success: true, message: 'Attendance updated', data: response });
        } catch (error) {
            next(error);
        }
    };
}
