import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../core/errors/http.error';
import type {
    ITeacherAttendanceService,
    ITeacherAttendanceController,
} from './teacher_attandance.interface';

export class TeacherAttendanceController implements ITeacherAttendanceController {
    constructor(private readonly service: ITeacherAttendanceService) {}

    create_attendance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const data = {
                ...req.body,
                branch_id: parseInt(req.body.branch_id),
                is_approved: req.body.is_approved === 'true' || req.body.is_approved === true,
            };
            const response = await this.service.create_attendance(data);
            res.status(201).json({ success: true, message: 'Attendance recorded', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_attendance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const data = {
                ...req.body,
                id: parseInt(req.params.id as string),
                branch_id: parseInt(req.body.branch_id),
                is_approved: req.body.is_approved === 'true' || req.body.is_approved === true,
            };
            const response = await this.service.update_attendance(data);
            res.status(200).json({ success: true, message: 'Attendance updated', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_attendance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.get_attendance(req.query as any);
            res.status(200).json({ success: true, message: 'Attendance fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    delete_attendance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await this.service.delete_attendance(parseInt(req.params.id as string));
            res.status(200).json({ success: true, message: 'Attendance deleted' });
        } catch (error) {
            next(error);
        }
    };

    report_teacher = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { teacher_id, month, year } = req.query;

            if (!month || !year) {
                throw new HttpError(400, 'Month and Year are required', 'MISSING_PARAMETERS', true);
            }

            const from_date = `${year}-${String(month).padStart(2, '0')}-01`;
            const to_date = new Date(Number(year), Number(month), 0).toISOString().split('T')[0];

            const response = await this.service.report_teacher({
                teacher_id: teacher_id ? parseInt(teacher_id as string) : undefined,
                from_date,
                to_date,
            });
            res.status(200).json({
                success: true,
                message: 'Attendance report fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };
}
