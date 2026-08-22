import type { Request, Response, NextFunction } from 'express';
import type { IUserService, IUserController } from './user.interface';

export class UserController implements IUserController {
    constructor(private readonly service: IUserService) {}

    create_user = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.create_user(req.body);
            res.status(201).json({ success: true, message: 'User created', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_users = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
            const response = await this.service.get_user(filter as any, pagination);
            res.status(200).json({ success: true, message: 'Users fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_user = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.get_user({ slug: req.params.slug as string });
            res.status(200).json({ success: true, message: 'User fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_user = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.update_user({
                ...req.body,
                id: parseInt(req.params.id as string),
            });
            res.status(200).json({ success: true, message: 'User updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    delete_user = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await this.service.delete_user(req.params.slug as string);
            res.status(200).json({ success: true, message: 'User deleted' });
        } catch (error) {
            next(error);
        }
    };
}
