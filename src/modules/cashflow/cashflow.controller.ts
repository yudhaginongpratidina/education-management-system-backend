import type { Request, Response, NextFunction } from 'express';
import type { ICashflowController, ICashflowService } from './cashflow.interface';

export class CashflowController implements ICashflowController {
    constructor(private readonly service: ICashflowService) {}

    private userId(req: Request): number | null {
        const user = (req as any).user;
        return user?.id ? Number(user.id) : null;
    }

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.list(req.query);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.create({
                ...req.body,
                created_by: this.userId(req),
            });
            res.status(201).json({ success: true, message: 'Transaksi dibuat', data });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.update(Number(req.params.id), req.body);
            res.status(200).json({ success: true, message: 'Transaksi diperbarui', data });
        } catch (error) {
            next(error);
        }
    };

    remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.remove(Number(req.params.id));
            res.status(200).json({ success: true, message: 'Transaksi dihapus' });
        } catch (error) {
            next(error);
        }
    };

    summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.summary(req.query);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    export = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const buffer = await this.service.export(req.query);
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader('Content-Disposition', 'attachment; filename=laporan-cashflow.xlsx');
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    };
}
