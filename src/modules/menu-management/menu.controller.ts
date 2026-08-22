import type { Request, Response, NextFunction } from 'express';
import type { IMenuService, IMenuController } from './menu.interface';

export class MenuController implements IMenuController {
    constructor(private readonly service: IMenuService) {}

    create_menu = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.create_menu(req.body);
            res.status(201).json({ success: true, message: 'Menu created', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_menu = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
            const response = await this.service.get_menu(filter as any, pagination);
            res.status(200).json({ success: true, message: 'Menu fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_menu = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.update_menu({ ...req.body, slug: req.params.slug });
            res.status(200).json({ success: true, message: 'Menu updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    delete_menu = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await this.service.delete_menu(req.params.slug as string);
            res.status(200).json({ success: true, message: 'Menu deleted' });
        } catch (error) {
            next(error);
        }
    };
}
