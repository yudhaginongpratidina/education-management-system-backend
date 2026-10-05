import type { Request, Response, NextFunction } from 'express';
import type { IAssetController, IAssetService } from './asset.interface';

export class AssetController implements IAssetController {
    constructor(private readonly service: IAssetService) {}

    private userId(req: Request): number | null {
        const user = (req as any).user;
        return user?.id ? Number(user.id) : null;
    }

    // ---------------- categories ----------------
    createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.createCategory(req.body);
            res.status(201).json({ success: true, message: 'Kategori dibuat', data });
        } catch (error) {
            next(error);
        }
    };

    getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getCategories(req.query as any);
            res.status(200).json({ success: true, message: 'Kategori diambil', data });
        } catch (error) {
            next(error);
        }
    };

    getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getCategory(Number(req.params.id));
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.updateCategory(Number(req.params.id), req.body);
            res.status(200).json({ success: true, message: 'Kategori diperbarui', data });
        } catch (error) {
            next(error);
        }
    };

    deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.deleteCategory(Number(req.params.id));
            res.status(200).json({ success: true, message: 'Kategori dihapus' });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- assets ----------------
    createAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.createAsset({
                ...req.body,
                created_by: this.userId(req),
            });
            res.status(201).json({ success: true, message: 'Aset dibuat', data });
        } catch (error) {
            next(error);
        }
    };

    getAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAssets(req.query as any);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    getAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAsset(Number(req.params.id));
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    updateAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.updateAsset(Number(req.params.id), req.body);
            res.status(200).json({ success: true, message: 'Aset diperbarui', data });
        } catch (error) {
            next(error);
        }
    };

    deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.deleteAsset(Number(req.params.id));
            res.status(200).json({ success: true, message: 'Aset dihapus' });
        } catch (error) {
            next(error);
        }
    };

    getAssetSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAssetSummary(req.query as any);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    addMovement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.addMovement(Number(req.params.id), {
                ...req.body,
                created_by: this.userId(req),
            });
            res.status(201).json({ success: true, message: 'Perpindahan aset dicatat', data });
        } catch (error) {
            next(error);
        }
    };

    getMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getMovements(Number(req.params.id));
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
