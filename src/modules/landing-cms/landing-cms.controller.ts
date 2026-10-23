import type { Request, Response, NextFunction } from 'express';
import type { ILandingCmsController, ILandingCmsService } from './landing-cms.interface';
import type { IStorageService } from '../storage/storage.interface';

export class LandingCmsController implements ILandingCmsController {
    constructor(
        private readonly service: ILandingCmsService,
        private readonly storageService: IStorageService,
    ) {}

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

    uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const file =
                req.file ||
                (req.files &&
                    ((req.files as any).image?.[0] || (req.files as any).file?.[0]));

            if (!file) {
                res.status(400).json({ success: false, message: 'File gambar wajib diunggah' });
                return;
            }

            if (!file.mimetype.startsWith('image/')) {
                res.status(400).json({
                    success: false,
                    message:
                        'Format file tidak valid. Harap unggah file gambar (PNG, JPG, WEBP, SVG, GIF)',
                });
                return;
            }

            const uploaded = await this.storageService.upload(file);
            res.status(201).json({
                success: true,
                message: 'Gambar berhasil diunggah',
                data: {
                    url: `/storage/${uploaded.slug}`,
                    slug: uploaded.slug,
                    original_name: uploaded.original_name,
                    mime_type: uploaded.mime_type,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
