import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import {
    addSessionStudentSchema,
    attendanceSchema,
    bulkAttendanceSchema,
    calendarQuerySchema,
    createClassSessionSchema,
    generateSessionsSchema,
    listSessionSchema,
    rescheduleSessionSchema,
    sessionIdParamsSchema,
    sessionParamsSchema,
    sessionStudentParamsSchema,
    substituteTeacherSchema,
    updateSessionSchema,
    updateSessionStudentSchema,
} from './class-session.validation';
import type { ISessionController } from './class-session.interface';

export class SessionRoutes {
    constructor(private readonly controller: ISessionController) {}

    /**
     * Routes nested under a class: /classes/:classId/sessions
     */
    classRouter(): Router {
        const router = Router();
        router.use(authMiddleware);

        // ---------- class sessions (nested under a class) ----------
        router.get(
            '/:classId/sessions',
            validate(listSessionSchema),
            asyncHandler(this.controller.getClassSessions),
        );
        router.post(
            '/:classId/sessions',
            validate(createClassSessionSchema),
            asyncHandler(this.controller.createClassSession),
        );
        router.post(
            '/:classId/sessions/generate',
            validate(generateSessionsSchema),
            asyncHandler(this.controller.generateSessions),
        );
        router.get(
            '/:classId/sessions/:id',
            validate(sessionParamsSchema),
            asyncHandler(this.controller.getSession),
        );
        router.patch(
            '/:classId/sessions/:id',
            validate(updateSessionSchema),
            asyncHandler(this.controller.updateSession),
        );
        router.delete(
            '/:classId/sessions/:id',
            validate(sessionParamsSchema),
            asyncHandler(this.controller.deleteSession),
        );

        return router;
    }

    /**
     * Global session routes: /sessions
     */
    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        // ---------- sessions ----------
        router.get(
            '/calendar',
            validate(calendarQuerySchema),
            asyncHandler(this.controller.getCalendar),
        );
        router.get('/', validate(listSessionSchema), asyncHandler(this.controller.getSessions));
        router.get('/:id', validate(sessionParamsSchema), asyncHandler(this.controller.getSession));
        router.patch(
            '/:id',
            validate(updateSessionSchema),
            asyncHandler(this.controller.updateSession),
        );
        router.delete(
            '/:id',
            validate(sessionParamsSchema),
            asyncHandler(this.controller.deleteSession),
        );
        router.post(
            '/:id/reschedule',
            validate(rescheduleSessionSchema),
            asyncHandler(this.controller.rescheduleSession),
        );
        router.post(
            '/:id/substitute-teacher',
            validate(substituteTeacherSchema),
            asyncHandler(this.controller.substituteTeacher),
        );

        // ---------- session students ----------
        router.get(
            '/:sessionId/students',
            validate(sessionIdParamsSchema),
            asyncHandler(this.controller.getSessionStudents),
        );
        router.post(
            '/:sessionId/students',
            validate(addSessionStudentSchema),
            asyncHandler(this.controller.addSessionStudent),
        );
        router.patch(
            '/:sessionId/students/:studentProgramId/attendance',
            validate(attendanceSchema),
            asyncHandler(this.controller.updateAttendance),
        );
        router.patch(
            '/:sessionId/students/:studentProgramId',
            validate(updateSessionStudentSchema),
            asyncHandler(this.controller.updateSessionStudent),
        );
        router.delete(
            '/:sessionId/students/:studentProgramId',
            validate(sessionStudentParamsSchema),
            asyncHandler(this.controller.removeSessionStudent),
        );

        // ---------- bulk attendance ----------
        router.patch(
            '/:sessionId/attendance',
            validate(bulkAttendanceSchema),
            asyncHandler(this.controller.bulkUpdateAttendance),
        );

        return router;
    }
}
