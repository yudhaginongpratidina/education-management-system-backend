import type { ITeacherController, ITeacherService } from './teacher.interface';
import type { Request, Response, NextFunction } from 'express';

export class TeacherController implements ITeacherController {
    constructor(private readonly teacherService: ITeacherService) {}

    create_teacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.teacherService.create_teacher({
                ...req.body,
                still_actively_working: req.body.still_actively_working ?? true,
            });
            res.status(201).json({ success: true, message: 'Teacher created', data: result });
        } catch (error) {
            next(error);
        }
    };

    get_teacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.teacherService.get_teacher(req.query);
            res.status(200).json({ success: true, message: 'Teachers retrieved', data: result });
        } catch (error) {
            next(error);
        }
    };

    update_teacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Find the teacher by slug to get the ID
            const teachers = await this.teacherService.get_teacher({
                slug: req.params.slug as string,
            });
            if (!teachers || teachers.length === 0) {
                res.status(404).json({ message: 'Teacher not found' });
                return;
            }

            const result = await this.teacherService.update_teacher({
                ...req.body,
                id: teachers[0].id,
                slug: req.params.slug,
                still_actively_working:
                    req.body.still_actively_working ?? teachers[0].still_actively_working,
            });
            res.status(200).json({ success: true, message: 'Teacher updated', data: result });
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
