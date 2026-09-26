import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import { classIdParamsSchema } from '../../shared/class/class.validation';
import {
    addClassTeacherSchema,
    classTeacherParamsSchema,
    updateClassTeacherSchema,
} from './class-teacher.validation';
import type { IClassTeacherController } from './class-teacher.interface';

export class ClassTeacherRoutes {
    constructor(private readonly controller: IClassTeacherController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        // ---------- class teachers ----------
        router.get(
            '/:classId/teachers',
            validate(classIdParamsSchema),
            asyncHandler(this.controller.getClassTeachers),
        );
        router.post(
            '/:classId/teachers',
            validate(addClassTeacherSchema),
            asyncHandler(this.controller.addClassTeacher),
        );
        router.patch(
            '/:classId/teachers/:id',
            validate(updateClassTeacherSchema),
            asyncHandler(this.controller.updateClassTeacher),
        );
        router.delete(
            '/:classId/teachers/:id',
            validate(classTeacherParamsSchema),
            asyncHandler(this.controller.removeClassTeacher),
        );

        return router;
    }
}
