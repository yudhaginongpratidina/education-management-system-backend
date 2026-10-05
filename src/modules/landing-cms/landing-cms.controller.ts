import type { Request, Response, NextFunction } from 'express';
import type { ILandingCmsController, ILandingCmsService } from './landing-cms.interface';

export class LandingCmsController implements ILandingCmsController {
    constructor(private readonly service: ILandingCmsService) {}

    private userId(req: Request): number | null {
        const user = (req as any).user;
        return user?.id ? Number(user.id) : null;
    }

    getPublicContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getPublicContent();
            res.status(200).json({ success: true, message: 'Landing content fetched', data });
        } catch (error) {
            next(error);
        }
    };

    getSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getSections();
            res.status(200).json({ success: true, message: 'Landing sections fetched', data });
        } catch (error) {
            next(error);
        }
    };

    getSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getSection(String(req.params.key));
            res.status(200).json({ success: true, message: 'Landing section fetched', data });
        } catch (error) {
            next(error);
        }
    };

    upsertSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.upsertSection(
                String(req.params.key),
                req.body.content,
                req.body.is_active !== false,
                this.userId(req),
            );
            res.status(200).json({ success: true, message: 'Landing section saved', data });
        } catch (error) {
            next(error);
        }
    };

    bulkUpsert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.bulkUpsert(req.body.sections, this.userId(req));
            res.status(200).json({ success: true, message: 'Landing sections saved', data });
        } catch (error) {
            next(error);
        }
    };

    deleteSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.deleteSection(String(req.params.key));
            res.status(200).json({ success: true, message: 'Landing section deleted' });
        } catch (error) {
            next(error);
        }
    };

    reset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.reset();
            res.status(200).json({ success: true, message: 'Landing content reset' });
        } catch (error) {
            next(error);
        }
    };
}
