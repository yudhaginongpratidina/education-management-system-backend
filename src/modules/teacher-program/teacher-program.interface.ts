import type { Request, Response, NextFunction } from 'express';

export interface ITeacherProgramRepository {
    bulk_create_teacher_program(
        data: {
            teacher_id: number;
            program_id: number;
        }[],
    ): Promise<any>;
    get_teacher_programs(filter: { teacher_id?: number; program_id?: number }): Promise<any>;
    delete_teacher_program(data: { teacher_id: number; program_id: number }): Promise<any>;
}

export interface ITeacherProgramService {
    bulk_create_teacher_program(
        data: {
            teacher_id: number;
            program_id: number;
        }[],
    ): Promise<any>;
    get_teacher_programs(filter: { teacher_id?: number; program_id?: number }): Promise<any>;
    delete_teacher_program(data: { teacher_id: number; program_id: number }): Promise<any>;
}

export interface ITeacherProgramController {
    bulk_create_teacher_program(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_teacher_programs(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete_teacher_program(req: Request, res: Response, next: NextFunction): Promise<void>;
}
