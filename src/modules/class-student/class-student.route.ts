import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import {
    addClassStudentSchema,
    classStudentParamsSchema,
    updateClassStudentSchema,
} from './class-student.validation';
import { classIdParamsSchema } from '../../shared/class/class.validation';
import type { IClassStudentController } from './class-student.interface';

export class ClassStudentRoutes {
    constructor(private readonly controller: IClassStudentController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        // ---------- class students ----------
        router.get(
            '/:classId/students',
            validate(classIdParamsSchema),
            asyncHandler(this.controller.getClassStudents),
        );
        router.post(
            '/:classId/students',
            validate(addClassStudentSchema),
            asyncHandler(this.controller.addClassStudent),
        );
        router.patch(
            '/:classId/students/:studentProgramId',
            validate(updateClassStudentSchema),
            asyncHandler(this.controller.updateClassStudent),
        );
        router.delete(
            '/:classId/students/:studentProgramId',
            validate(classStudentParamsSchema),
            asyncHandler(this.controller.removeClassStudent),
        );

        return router;
    }
}
