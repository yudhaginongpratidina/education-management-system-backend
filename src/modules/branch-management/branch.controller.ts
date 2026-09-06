import type { Request, Response, NextFunction } from 'express';
import type { IBranchService, IBranchController } from './branch.interface';

export class BranchController implements IBranchController {
    constructor(private readonly service: IBranchService) {}

    create_branch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.create_branch(req.body);
            res.status(201).json({ success: true, message: 'Branch created', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_branches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filter: any = {};
            if (req.query.slug) filter.slug = req.query.slug;
            if (req.query.id) filter.id = parseInt(req.query.id as string);
            if (req.query.name) filter.name = req.query.name;

            const response = await this.service.get_branch(filter);
            res.status(200).json({ success: true, message: 'Branches fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_branch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;
            const response = await this.service.get_branch({ slug });
            if (!response) {
                res.status(404).json({ success: false, message: 'Branch not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Branch fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_branch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.update_branch({
                ...req.body,
                id: parseInt(req.params.id as string),
            });
            res.status(200).json({ success: true, message: 'Branch updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    delete_branch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.delete_branch(req.params.slug as string);
            res.status(200).json({ success: true, message: 'Branch deleted' });
        } catch (error) {
            next(error);
        }
    };
}
