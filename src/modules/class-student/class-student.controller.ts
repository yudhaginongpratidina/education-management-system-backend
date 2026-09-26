import type { Request, Response, NextFunction } from 'express';
import type { IClassStudentController, IClassStudentService } from './class-student.interface';

export class ClassStudentController implements IClassStudentController {
    constructor(private readonly service: IClassStudentService) {}

    getClassStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.getClassStudents(Number(req.params.classId));
            res.status(200).json({
                success: true,
                message: 'Class students fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    addClassStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.addClassStudent(
                Number(req.params.classId),
                req.body,
            );
            res.status(201).json({
                success: true,
                message: 'Student added to class',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    updateClassStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.updateClassStudent(
                Number(req.params.classId),
                Number(req.params.studentProgramId),
                req.body,
            );
            res.status(200).json({
                success: true,
                message: 'Class student updated',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    removeClassStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const response = await this.service.removeClassStudent(
                Number(req.params.classId),
                Number(req.params.studentProgramId),
            );
            res.status(200).json({
                success: true,
                message: 'Student removed from class',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };
}
