import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import { reportQuerySchema } from './report.validation';
import type { IReportController } from './report.interface';

export class ReportRoutes {
    constructor(private readonly controller: IReportController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        router.get(
            '/overview',
            validate(reportQuerySchema),
            asyncHandler(this.controller.getOverview),
        );
        router.get(
            '/teacher-attendance',
            validate(reportQuerySchema),
            asyncHandler(this.controller.getTeacherAttendance),
        );
        router.get(
            '/student-attendance',
            validate(reportQuerySchema),
            asyncHandler(this.controller.getStudentAttendance),
        );
        router.get(
            '/student-attendance/summary',
            validate(reportQuerySchema),
            asyncHandler(this.controller.getStudentAttendanceSummary),
        );
        router.get(
            '/sessions',
            validate(reportQuerySchema),
            asyncHandler(this.controller.getSessions),
        );
        router.get(
            '/reschedules',
            validate(reportQuerySchema),
            asyncHandler(this.controller.getReschedules),
        );

        router.get(
            '/export/teacher-attendance',
            validate(reportQuerySchema),
            asyncHandler(this.controller.exportTeacherAttendance),
        );
        router.get(
            '/export/student-attendance',
            validate(reportQuerySchema),
            asyncHandler(this.controller.exportStudentAttendance),
        );
        router.get(
            '/export/sessions',
            validate(reportQuerySchema),
            asyncHandler(this.controller.exportSessions),
        );
        router.get(
            '/export/reschedules',
            validate(reportQuerySchema),
            asyncHandler(this.controller.exportReschedules),
        );

        return router;
    }
}
