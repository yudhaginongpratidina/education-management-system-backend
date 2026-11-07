import type { Request, Response, NextFunction } from 'express';
import type {
    IManualAttendanceController,
    IManualAttendanceService,
} from './manual-attendance.interface';

export class ManualAttendanceController implements IManualAttendanceController {
    constructor(private readonly service: IManualAttendanceService) {}

    private getUserId(req: Request): number | null {
        const user = (req as any).user;
        return user?.id ? Number(user.id) : null;
    }

    record = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const adminUserId = this.getUserId(req);
            const result = await this.service.record(req.body, adminUserId);
            res.status(201).json({
                success: true,
                message: 'Presensi manual berhasil dicatat',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.get(req.query as any);
            res.status(200).json({
                success: true,
                message: 'Data presensi berhasil diambil',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const result = await this.service.getById(id);
            res.status(200).json({
                success: true,
                message: 'Detail presensi berhasil diambil',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const adminUserId = this.getUserId(req);
            const result = await this.service.update(id, req.body, adminUserId);
            res.status(200).json({
                success: true,
                message: 'Presensi manual berhasil diperbarui',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            await this.service.delete(id);
            res.status(200).json({
                success: true,
                message: 'Presensi berhasil dihapus',
            });
        } catch (error) {
            next(error);
        }
    };
}
