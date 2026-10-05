import type { Request, Response, NextFunction } from 'express';
import type {
    ISessionRescheduleController,
    ISessionRescheduleService,
} from './session-reschedule.interface';

const parsePagination = (query: any): { limit: number; offset: number } | undefined => {
    if (!query.limit || !query.page) return undefined;
    const limit = parseInt(query.limit, 10);
    const page = parseInt(query.page, 10);
    if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) return undefined;
    return { limit, offset: (page - 1) * limit };
};

export class SessionRescheduleController implements ISessionRescheduleController {
    constructor(private readonly service: ISessionRescheduleService) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filter: any = { ...req.query };
            delete filter.limit;
            delete filter.page;
            const data = await this.service.list(filter, parsePagination(req.query));
            res.status(200).json({ success: true, message: 'Reschedules fetched', data });
        } catch (error) {
            next(error);
        }
    };
}
