import type { Request, Response, NextFunction } from 'express';
import type { IClassScheduleController, IClassScheduleService } from './class-schedule.interface';

export class ClassScheduleController implements IClassScheduleController {
    constructor(private readonly service: IClassScheduleService) {}

    getClassSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getClassSchedules(Number(req.params.classId));
            res.status(200).json({
                success: true,
                message: 'Class schedules fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    addClassSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.addClassSchedule(
                Number(req.params.classId),
                req.body,
            );
            res.status(201).json({
                success: true,
                message: 'Class schedule created',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    updateClassSchedule = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.service.updateClassSchedule(
                Number(req.params.classId),
                Number(req.params.id),
                req.body,
            );
            res.status(200).json({
                success: true,
                message: 'Class schedule updated',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    removeClassSchedule = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await this.service.removeClassSchedule(
                Number(req.params.classId),
                Number(req.params.id),
            );
            res.status(200).json({
                success: true,
                message: 'Class schedule deleted',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };
}
