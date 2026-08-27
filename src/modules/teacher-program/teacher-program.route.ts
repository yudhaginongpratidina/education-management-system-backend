import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import {
    createTeacherProgramSchema,
    deleteTeacherProgramSchema,
} from './teacher-program.validation';

// interface
import type { ITeacherProgramController } from './teacher-program.interface';

export class TeacherProgramRoutes {
    constructor(private controller: ITeacherProgramController) {}

    router() {
        const router = Router();

        router.get('/', asyncHandler(this.controller.get_teacher_programs));
        router.post(
            '/',
            validate(createTeacherProgramSchema),
            asyncHandler(this.controller.bulk_create_teacher_program),
        );
        router.delete(
            '/',
            validate(deleteTeacherProgramSchema),
            asyncHandler(this.controller.delete_teacher_program),
        );

        return router;
    }
}
