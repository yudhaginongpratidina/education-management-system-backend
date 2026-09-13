import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';

import {
    reportAttendanceByBranchIdSchema,
    reportAttendanceByTeacherIdSchema,
} from './report-attendance.validation';
import type { IReportAttendanceController } from './report-attendance.interface';

export class ReportAttendanceRoutes {
    constructor(private controller: IReportAttendanceController) {}

    router() {
        const router = Router();
        router.get(
            '/branch/:branch_id',
            authMiddleware,
            validate(reportAttendanceByBranchIdSchema),
            asyncHandler(this.controller.report_attendance_by_branch_id),
        );
        router.get(
            '/teacher/:teacher_id',
            authMiddleware,
            validate(reportAttendanceByTeacherIdSchema),
            asyncHandler(this.controller.report_attendance_by_teacher_id),
        );
        return router;
    }
}
