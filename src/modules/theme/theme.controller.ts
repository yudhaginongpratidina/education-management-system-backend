import type { Request, Response, NextFunction } from 'express';
import type { IThemeController, IThemeService } from './theme.interface';
import type { IStorageService } from '../storage/storage.interface';

export class ThemeController implements IThemeController {
    constructor(
        private readonly service: IThemeService,
        private readonly storageService: IStorageService,
    ) {}

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

    uploadLogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const singleFile = req.file || files?.logo?.[0] || files?.file?.[0] || files?.image?.[0];

            if (!singleFile) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }

            const uploaded = await this.storageService.upload(singleFile);
            const url = `/storage/${uploaded.slug}`;

            res.status(200).json({
                success: true,
                message: 'Logo uploaded successfully',
                data: {
                    url,
                    filename: uploaded.original_name,
                    slug: uploaded.slug,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
