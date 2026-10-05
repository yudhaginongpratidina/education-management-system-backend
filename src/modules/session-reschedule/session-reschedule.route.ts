import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import { listRescheduleSchema } from './session-reschedule.validation';
import type { ISessionRescheduleController } from './session-reschedule.interface';

export class SessionRescheduleRoutes {
    constructor(private readonly controller: ISessionRescheduleController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        router.get('/', validate(listRescheduleSchema), asyncHandler(this.controller.list));

        return router;
    }
}
