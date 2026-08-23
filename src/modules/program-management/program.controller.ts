import type { Request, Response, NextFunction } from 'express';
import type { IProgramService, IProgramController } from './program.interface';

export class ProgramController implements IProgramController {
    constructor(private readonly service: IProgramService) {}

    create_program = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.create_program(req.body);
            res.status(201).json({ success: true, message: 'Program created', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_programs = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
            const response = await this.service.get_program(filter as any, pagination);
            res.status(200).json({ success: true, message: 'Programs fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_program = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.get_program({ slug: req.params.slug as string });
            res.status(200).json({ success: true, message: 'Program fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_program = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.update_program({
                ...req.body,
                slug: req.params.slug,
            });
            res.status(200).json({ success: true, message: 'Program updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    delete_program = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await this.service.delete_program(req.params.slug as string);
            res.status(200).json({ success: true, message: 'Program deleted' });
        } catch (error) {
            next(error);
        }
    };
}
