import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import { classIdParamsSchema } from '../../shared/class/class.validation';
import {
    classScheduleParamsSchema,
    createClassScheduleSchema,
    updateClassScheduleSchema,
} from './class-schedule.validation';
import type { IClassScheduleController } from './class-schedule.interface';

export class ClassScheduleRoutes {
    constructor(private readonly controller: IClassScheduleController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        // ---------- class schedules ----------
        router.get(
            '/:classId/schedules',
            validate(classIdParamsSchema),
            asyncHandler(this.controller.getClassSchedules),
        );
        router.post(
            '/:classId/schedules',
            validate(createClassScheduleSchema),
            asyncHandler(this.controller.addClassSchedule),
        );
        router.patch(
            '/:classId/schedules/:id',
            validate(updateClassScheduleSchema),
            asyncHandler(this.controller.updateClassSchedule),
        );
        router.delete(
            '/:classId/schedules/:id',
            validate(classScheduleParamsSchema),
            asyncHandler(this.controller.removeClassSchedule),
        );

        return router;
    }
}
