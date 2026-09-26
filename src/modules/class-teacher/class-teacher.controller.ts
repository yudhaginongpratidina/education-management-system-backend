import type { Request, Response, NextFunction } from 'express';
import type { IClassTeacherController, IClassTeacherService } from './class-teacher.interface';

export class ClassTeacherController implements IClassTeacherController {
    constructor(private readonly service: IClassTeacherService) {}

    getClassTeachers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getClassTeachers(Number(req.params.classId));
            res.status(200).json({
                success: true,
                message: 'Class teachers fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    addClassTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.addClassTeacher(
                Number(req.params.classId),
                req.body,
            );
            res.status(201).json({
                success: true,
                message: 'Teacher assigned to class',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    updateClassTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.updateClassTeacher(
                Number(req.params.classId),
                Number(req.params.id),
                req.body,
            );
            res.status(200).json({
                success: true,
                message: 'Class teacher updated',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    removeClassTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.removeClassTeacher(
                Number(req.params.classId),
                Number(req.params.id),
            );
            res.status(200).json({
                success: true,
                message: 'Teacher removed from class',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };
}
