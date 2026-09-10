import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.middleware';
import { approveAttendanceSchema } from './attendance-approve.validation';
import type { IAttendanceApproveController } from './attendance-approve.interface';

export class AttendanceApproveRoutes {
    constructor(private readonly controller: IAttendanceApproveController) {}

    router(): Router {
        const router = Router();
        router.put(
            '/:id',
            validate(approveAttendanceSchema),
            this.controller.approve_attendance.bind(this.controller),
        );
        router.get('/', this.controller.get_unapproved_attendances.bind(this.controller));
        return router;
    }
}
