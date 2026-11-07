import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import { requireSuperAdmin } from '../../shared/middleware/role.middleware';
import {
    recordManualAttendanceSchema,
    updateManualAttendanceSchema,
    getManualAttendanceSchema,
} from './manual-attendance.validation';
import type { IManualAttendanceController } from './manual-attendance.interface';

export class ManualAttendanceRoutes {
    constructor(private readonly controller: IManualAttendanceController) {}

    router(): Router {
        const router = Router();

        // 🔐 STRICT AUTHORIZATION: Hanya Super Admin yang diizinkan
        router.use(authMiddleware);
        router.use(requireSuperAdmin);

        router.get('/', validate(getManualAttendanceSchema), asyncHandler(this.controller.get));
        router.post('/', validate(recordManualAttendanceSchema), asyncHandler(this.controller.record));
        router.get('/:id', asyncHandler(this.controller.getById));
        router.put('/:id', validate(updateManualAttendanceSchema), asyncHandler(this.controller.update));
        router.delete('/:id', asyncHandler(this.controller.delete));

        return router;
    }
}
