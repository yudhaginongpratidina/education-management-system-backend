import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import { updateThemeSchema } from './theme.validation';
import type { IThemeController } from './theme.interface';

export class ThemeRoutes {
    constructor(private readonly controller: IThemeController) {}

    router(): Router {
        const router = Router();

        // Public route: everyone (including landing page and unauthenticated users) can fetch the active theme
        router.get('/', asyncHandler(this.controller.getTheme));

        // Protected routes: updating or resetting requires authentication
        router.use(authMiddleware);

        router.put('/', validate(updateThemeSchema), asyncHandler(this.controller.updateTheme));
        router.post('/reset', asyncHandler(this.controller.resetTheme));

        return router;
    }
}
