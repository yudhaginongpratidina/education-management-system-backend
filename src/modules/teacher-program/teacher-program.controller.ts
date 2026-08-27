import type { Request, Response, NextFunction } from 'express';
import type {
    ITeacherProgramService,
    ITeacherProgramController,
} from './teacher-program.interface';

export class TeacherProgramController implements ITeacherProgramController {
    constructor(private readonly service: ITeacherProgramService) {}

    bulk_create_teacher_program = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> => {
        try {
            const response = await this.service.bulk_create_teacher_program(req.body);
            res.status(201).json({
                success: true,
                message: 'Teacher-Program mapping created',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    get_teacher_programs = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> => {
        try {
            const { teacher_id, program_id } = req.query;
            const filter: { teacher_id?: number; program_id?: number } = {};
            if (teacher_id) filter.teacher_id = parseInt(teacher_id as string);
            if (program_id) filter.program_id = parseInt(program_id as string);

            const response = await this.service.get_teacher_programs(filter);
            res.status(200).json({
                success: true,
                message: 'Teacher-Programs fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    delete_teacher_program = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> => {
        try {
            const { teacher_id, program_id } = req.body;
            await this.service.delete_teacher_program({ teacher_id, program_id });
            res.status(200).json({ success: true, message: 'Teacher-Program mapping deleted' });
        } catch (error) {
            next(error);
        }
    };
}
