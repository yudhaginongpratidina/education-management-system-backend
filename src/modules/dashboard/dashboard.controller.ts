import type { Request, Response, NextFunction } from 'express';
import type { IDashboardController, IDashboardService } from './dashboard.interface';

export class DashboardController implements IDashboardController {
    constructor(private readonly service: IDashboardService) {}

    get_total_branch = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const total = await this.service.get_total_branch();
            return res.status(200).json({ success: true, data: { total } });
        } catch (error) {
            next(error);
        }
    };

    get_total_teacher = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const total = await this.service.get_total_teacher();
            return res.status(200).json({ success: true, data: { total } });
        } catch (error) {
            next(error);
        }
    };

    get_total_program = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const total = await this.service.get_total_program();
            return res.status(200).json({ success: true, data: { total } });
        } catch (error) {
            next(error);
        }
    };

    get_total_role = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const total = await this.service.get_total_role();
            return res.status(200).json({ success: true, data: { total } });
        } catch (error) {
            next(error);
        }
    };

    get_total_menu = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const total = await this.service.get_total_menu();
            return res.status(200).json({ success: true, data: { total } });
        } catch (error) {
            next(error);
        }
    };

    get_total_user = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const total = await this.service.get_total_user();
            return res.status(200).json({ success: true, data: { total } });
        } catch (error) {
            next(error);
        }
    };
}
