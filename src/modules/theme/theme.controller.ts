import type { Request, Response, NextFunction } from 'express';
import type { IThemeController, IThemeService } from './theme.interface';

export class ThemeController implements IThemeController {
    constructor(private readonly service: IThemeService) {}

    private userId(req: Request): number | null {
        const user = (req as any).user;
        return user?.id ? Number(user.id) : null;
    }

    getTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getTheme();
            res.status(200).json({
                success: true,
                message: 'Active theme fetched successfully',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    updateTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.updateTheme(req.body, this.userId(req));
            res.status(200).json({
                success: true,
                message: 'Theme updated successfully',
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    resetTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.resetTheme(this.userId(req));
            res.status(200).json({
                success: true,
                message: 'Theme reset to default BANYAN theme successfully',
                data,
            });
        } catch (error) {
            next(error);
        }
    };
}
