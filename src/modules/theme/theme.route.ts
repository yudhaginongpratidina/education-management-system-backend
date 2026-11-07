import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import { updateThemeSchema } from './theme.validation';
import type { IThemeController } from './theme.interface';

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export class ThemeRoutes {
    constructor(private readonly controller: IThemeController) {}

    router(): Router {
        const router = Router();

        // Public route: everyone (including landing page and unauthenticated users) can fetch the active theme
        router.get('/', asyncHandler(this.controller.getTheme));

        // Protected routes: updating, resetting, or uploading requires authentication
        router.use(authMiddleware);

        router.post(
            '/upload-logo',
            upload.fields([
                { name: 'logo', maxCount: 1 },
                { name: 'image', maxCount: 1 },
                { name: 'file', maxCount: 1 },
            ]),
            asyncHandler(this.controller.uploadLogo),
        );

        router.put('/', validate(updateThemeSchema), asyncHandler(this.controller.updateTheme));
        router.post('/reset', asyncHandler(this.controller.resetTheme));

        return router;
    }
}
