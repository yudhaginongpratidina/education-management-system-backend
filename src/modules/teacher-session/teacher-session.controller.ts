import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../core/errors/http.error';
import type { ClassSessionStatus } from '../../shared/class/class.types';
import type {
    ITeacherSessionController,
    ITeacherSessionService,
} from './teacher-session.interface';

const parsePagination = (query: any): { limit: number; offset: number } | undefined => {
    if (!query.limit || !query.page) return undefined;
    const limit = parseInt(query.limit, 10);
    const page = parseInt(query.page, 10);
    if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) return undefined;
    return { limit, offset: (page - 1) * limit };
};

export class TeacherSessionController implements ITeacherSessionController {
    constructor(private readonly service: ITeacherSessionService) {}

    // The authenticated user comes from the JWT (see auth.middleware.ts).
    private getUserId(req: Request): number {
        const user = (req as any).user;
        const userId = Number(user?.id);
        if (!userId) {
            throw new HttpError(401, 'Authentication required', 'NOT_AUTHENTICATED', true);
        }
        return userId;
    }

    private queryFilter(query: any): Record<string, any> {
        const filter: Record<string, any> = { ...query };
        delete filter.limit;
        delete filter.page;
        return filter;
    }

    getMySessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getMySessions(
                this.getUserId(req),
                this.queryFilter(req.query),
                parsePagination(req.query),
            );
            res.status(200).json({
                success: true,
                message: 'Your sessions fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    getMySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getMySummary(
                this.getUserId(req),
                this.queryFilter(req.query),
            );
            res.status(200).json({
                success: true,
                message: 'Your session summary fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    getMySchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getMySchedule(this.getUserId(req));
            res.status(200).json({
                success: true,
                message: 'Your schedule fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    getMySession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getMySessionDetail(
                this.getUserId(req),
                Number(req.params.id),
            );
            res.status(200).json({ success: true, message: 'Session fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    getMySessionStudents = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.service.getMySessionStudents(
                this.getUserId(req),
                Number(req.params.id),
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

    updateMySessionStatus = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.service.updateMySessionStatus(
                this.getUserId(req),
                Number(req.params.id),
                req.body.status as ClassSessionStatus,
            );
            res.status(200).json({
                success: true,
                message: 'Session status updated',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    updateMyAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.updateMyAttendance(
                this.getUserId(req),
                Number(req.params.id),
                Number(req.params.studentProgramId),
                req.body,
            );
            res.status(200).json({ success: true, message: 'Attendance updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    bulkUpdateMyAttendance = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.service.bulkUpdateMyAttendance(
                this.getUserId(req),
                Number(req.params.id),
                req.body.records,
            );
            res.status(200).json({ success: true, message: 'Attendance updated', data: response });
        } catch (error) {
            next(error);
        }
    };
}
