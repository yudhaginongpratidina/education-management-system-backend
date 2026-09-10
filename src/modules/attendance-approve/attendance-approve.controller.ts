import type { Request, Response, NextFunction } from 'express';
import type {
    IAttendanceApproveController,
    IAttendanceApproveService,
} from './attendance-approve.interface';

export class AttendanceApproveController implements IAttendanceApproveController {
    constructor(private readonly service: IAttendanceApproveService) {}

    async approve_attendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { is_approved, notes } = req.body;
            const result = await this.service.approve_attendance({
                id: Number(id),
                is_approved,
                notes,
            });
            res.status(200).json({
                success: true,
                message: 'Attendance approved successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async get_unapproved_attendances(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { branch_id } = req.query;
            const result = await this.service.get_unapproved_attendances(Number(branch_id));
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
