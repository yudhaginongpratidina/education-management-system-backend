import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { createAttendanceSchema, updateAttendanceSchema } from './teacher_attandance.validation';

// interface
import type { ITeacherAttendanceController } from './teacher_attandance.interface';

export class TeacherAttendanceRoutes {
    constructor(private controller: ITeacherAttendanceController) {}

    router() {
        const router = Router();

        router.get('/', asyncHandler(this.controller.get_attendance));
        router.post(
            '/',
            validate(createAttendanceSchema),
            asyncHandler(this.controller.create_attendance),
        );
        router.patch(
            '/:id',
            validate(updateAttendanceSchema),
            asyncHandler(this.controller.update_attendance),
        );
        router.delete('/:id', asyncHandler(this.controller.delete_attendance));

        return router;
    }
}
