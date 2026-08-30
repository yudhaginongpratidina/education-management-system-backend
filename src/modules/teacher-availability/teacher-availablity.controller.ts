import type { Request, Response, NextFunction } from 'express';
import type {
    ITeacherAvailablityController,
    ITeacherAvailabilityService,
} from './teacher-availablity.interface';

export class TeacherAvailabilityController implements ITeacherAvailablityController {
    constructor(private readonly service: ITeacherAvailabilityService) {}

    create_availability = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const data = await this.service.create_availability(req.body);
            res.status(201).json({ success: true, message: 'Availability created', data });
        } catch (error) {
            next(error);
        }
    };

    get_availability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teacher_id = parseInt(req.params.teacher_id as string);
            const data = await this.service.get_availability(teacher_id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    update_availability = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const teacher_id = parseInt(req.params.teacher_id as string);
            await this.service.update_availability(teacher_id, req.body);
            res.status(200).json({ success: true, message: 'Availability updated' });
        } catch (error) {
            next(error);
        }
    };

    delete_availability = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const teacher_id = parseInt(req.params.teacher_id as string);
            await this.service.delete_availability(teacher_id);
            res.status(200).json({ success: true, message: 'Availability deleted' });
        } catch (error) {
            next(error);
        }
    };
}
