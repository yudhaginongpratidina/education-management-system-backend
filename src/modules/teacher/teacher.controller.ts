import type { ITeacherController, ITeacherService } from './teacher.interface';
import type { Request, Response, NextFunction } from 'express';

export class TeacherController implements ITeacherController {
    constructor(private readonly teacherService: ITeacherService) {}

    create_teacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.teacherService.create_teacher(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    get_teacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.teacherService.get_teacher(req.query as any);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    update_teacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.teacherService.update_teacher({
                ...req.body,
                slug: req.params.slug,
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    delete_teacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.teacherService.delete_teacher(req.params.slug as string);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
