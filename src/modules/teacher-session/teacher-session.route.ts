import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import {
    teacherAttendanceSchema,
    teacherBulkAttendanceSchema,
    teacherSessionListSchema,
    teacherSessionParamsSchema,
    teacherSessionStatusSchema,
    teacherSessionSummarySchema,
} from './teacher-session.validation';
import type { ITeacherSessionController } from './teacher-session.interface';

/**
 * Teacher "self service" routes.
 *
 * Everything here is scoped to the authenticated teacher: the controller reads
 * the user id from the JWT and the service resolves the linked teacher profile,
 * so a teacher can only read and mutate their own sessions.
 */
export class TeacherSessionRoutes {
    constructor(private readonly controller: ITeacherSessionController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        // ---------- my schedule ----------
        router.get('/schedule', asyncHandler(this.controller.getMySchedule));

        // ---------- my sessions ----------
        // Static segment must be declared before "/:id".
        router.get(
            '/sessions/summary',
            validate(teacherSessionSummarySchema),
            asyncHandler(this.controller.getMySummary),
        );
        router.get(
            '/sessions',
            validate(teacherSessionListSchema),
            asyncHandler(this.controller.getMySessions),
        );
        router.get(
            '/sessions/:id',
            validate(teacherSessionParamsSchema),
            asyncHandler(this.controller.getMySession),
        );

        // ---------- attendance on my sessions ----------
        router.get(
            '/sessions/:id/students',
            validate(teacherSessionParamsSchema),
            asyncHandler(this.controller.getMySessionStudents),
        );
        router.patch(
            '/sessions/:id/status',
            validate(teacherSessionStatusSchema),
            asyncHandler(this.controller.updateMySessionStatus),
        );
        router.patch(
            '/sessions/:id/attendance',
            validate(teacherBulkAttendanceSchema),
            asyncHandler(this.controller.bulkUpdateMyAttendance),
        );
        router.patch(
            '/sessions/:id/students/:studentProgramId/attendance',
            validate(teacherAttendanceSchema),
            asyncHandler(this.controller.updateMyAttendance),
        );

        return router;
    }
}
