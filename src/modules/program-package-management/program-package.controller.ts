import type { Request, Response, NextFunction } from 'express';
import type {
    IProgramPackageService,
    IProgramPackageController,
} from './program-package.interface';

export class ProgramPackageController implements IProgramPackageController {
    constructor(private readonly service: IProgramPackageService) {}

    create_package = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.create_package({
                program_slug: req.params.program_slug,
                ...req.body,
            });
            res.status(201).json({ success: true, message: 'Package created', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_packages = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
            const response = await this.service.get_packages(
                req.params.program_slug as string,
                filter as any,
                pagination,
            );
            res.status(200).json({ success: true, message: 'Packages fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_package = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.update_package({
                slug: req.params.slug,
                program_slug: req.body.program_slug,
                ...req.body,
            });
            res.status(200).json({ success: true, message: 'Package updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    delete_package = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await this.service.delete_package(req.params.slug as string);
            res.status(200).json({ success: true, message: 'Package deleted' });
        } catch (error) {
            next(error);
        }
    };
}
