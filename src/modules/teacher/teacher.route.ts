import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { createTeacherSchema, getTeacherSchema, updateTeacherSchema } from './teacher.validation';

// interface
import type { ITeacherController } from './teacher.interface';

export class TeacherRoutes {
    constructor(private controller: ITeacherController) {}

    router() {
        const router = Router();

        router.post(
            '/',
            validate(createTeacherSchema),
            asyncHandler(this.controller.create_teacher),
        );
        router.get('/', validate(getTeacherSchema), asyncHandler(this.controller.get_teacher));
        router.patch(
            '/:slug',
            validate(updateTeacherSchema),
            asyncHandler(this.controller.update_teacher),
        );
        router.delete('/:slug', asyncHandler(this.controller.delete_teacher));

        return router;
    }
}
