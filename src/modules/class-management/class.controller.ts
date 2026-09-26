import type { Request, Response, NextFunction } from 'express';
import type { IClassController, IClassService } from './class.interface';

const parsePagination = (query: any): { limit: number; offset: number } | undefined => {
    if (!query.limit || !query.page) return undefined;
    const limit = parseInt(query.limit, 10);
    const page = parseInt(query.page, 10);
    if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) return undefined;
    return { limit, offset: (page - 1) * limit };
};

export class ClassController implements IClassController {
    constructor(private readonly service: IClassService) {}

    // ---------- classes ----------
    createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.createClass(req.body);
            res.status(201).json({ success: true, message: 'Class created', data: response });
        } catch (error) {
            next(error);
        }
    };

    getClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filter: any = { ...(req.query as any) };
            delete filter.limit;
            delete filter.page;
            const response = await this.service.getClasses(filter, parsePagination(req.query));
            res.status(200).json({ success: true, message: 'Classes fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    getClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getClassById(Number(req.params.id));
            res.status(200).json({ success: true, message: 'Class fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    updateClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.updateClass(Number(req.params.id), req.body);
            res.status(200).json({ success: true, message: 'Class updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    deleteClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.deleteClass(Number(req.params.id));
            res.status(200).json({ success: true, message: 'Class deleted' });
        } catch (error) {
            next(error);
        }
    };
}
