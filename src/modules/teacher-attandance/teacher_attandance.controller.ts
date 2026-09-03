import type { Request, Response, NextFunction } from 'express';
import type {
    ITeacherAttendanceService,
    ITeacherAttendanceController,
} from './teacher_attandance.interface';

export class TeacherAttendanceController implements ITeacherAttendanceController {
    constructor(private readonly service: ITeacherAttendanceService) {}

    create_attendance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.create_attendance(req.body);
            res.status(201).json({ success: true, message: 'Attendance recorded', data: response });
        } catch (error) {
            next(error);
        }
    };

    update_attendance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.update_attendance({
                ...req.body,
                id: parseInt(req.params.id as string),
            });
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
}
