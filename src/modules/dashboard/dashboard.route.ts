import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import authMiddleware from '../../shared/middleware/auth.middleware';
import type { IDashboardController } from './dashboard.interface';

export class DashboardRoutes {
    constructor(private controller: IDashboardController) {}

    router() {
        const router = Router();
        router.get('/total-branch', authMiddleware, asyncHandler(this.controller.get_total_branch));
        router.get(
            '/total-teacher',
            authMiddleware,
            asyncHandler(this.controller.get_total_teacher),
        );
        router.get(
            '/total-program',
            authMiddleware,
            asyncHandler(this.controller.get_total_program),
        );
        router.get('/total-role', authMiddleware, asyncHandler(this.controller.get_total_role));
        router.get('/total-menu', authMiddleware, asyncHandler(this.controller.get_total_menu));
        router.get('/total-user', authMiddleware, asyncHandler(this.controller.get_total_user));
        return router;
    }
}
