import type { Request, Response, NextFunction } from 'express';
import type { IProgramLevelService, IProgramLevelController } from './prorgam-level.interface';

export class ProgramLevelController implements IProgramLevelController {
    constructor(private readonly service: IProgramLevelService) {}

    create_level = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.create_level({
                program_slug: req.params.program_slug,
                ...req.body,
            });
            res.status(201).json({ success: true, message: 'Level created', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_levels = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { limit, page, ...filter } = req.query;
            let pagination;
            if (limit && page) {
                const limitNum = parseInt(limit as string, 10);
                const pageNum = parseInt(page as string, 10);
                if (!isNaN(limitNum) && !isNaN(pageNum) && limitNum > 0 && pageNum > 0) {
                    pagination = { limit: limitNum, offset: (pageNum - 1) * limitNum };
                }
            }
            const response = await this.service.get_levels(
                req.params.program_slug,
                filter as any,
                pagination,
            );
            res.status(200).json({ success: true, message: 'Levels fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_level = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.update_level({
                program_slug: req.params.program_slug,
                level: parseInt(req.params.level),
                ...req.body,
            });
            res.status(200).json({ success: true, message: 'Level updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    delete_level = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await this.service.delete_level({
                program_slug: req.params.program_slug,
                level: parseInt(req.params.level),
            });
            res.status(200).json({ success: true, message: 'Level deleted' });
        } catch (error) {
            next(error);
        }
    };
}
