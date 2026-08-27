import { HttpError } from '../../core/errors/http.error';
import type {
    ITeacherProgramRepository,
    ITeacherProgramService,
} from './teacher-program.interface';

export class TeacherProgramService implements ITeacherProgramService {
    constructor(
        private repo: ITeacherProgramRepository,
        private cotainer: any,
    ) {}

    async bulk_create_teacher_program(
        data: {
            teacher_id: number;
            program_id: number;
        }[],
    ): Promise<any> {
        // Here we could add validation to check if teacher and program exist
        // But based on interface, keeping it simple
        return await this.repo.bulk_create_teacher_program(data);
    }

    async get_teacher_programs(filter: { teacher_id?: number; program_id?: number }): Promise<any> {
        return await this.repo.get_teacher_programs(filter);
    }

    async delete_teacher_program(data: { teacher_id: number; program_id: number }): Promise<any> {
        const existing = await this.repo.get_teacher_programs(data);
        if (existing.length === 0) {
            throw new HttpError(
                404,
                'Teacher-Program mapping not found',
                'TEACHER_PROGRAM_NOT_FOUND',
                true,
            );
        }

        return await this.repo.delete_teacher_program(data);
    }
}
