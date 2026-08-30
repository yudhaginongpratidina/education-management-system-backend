// dependencies
import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';

// middleware & validation
import authMiddleware from '../../shared/middleware/auth.middleware';
import { changePasswordSchema, loginSchema } from './auth.validation';

// interface
import type { IAuthController } from './auth.interface';

export class AuthRoutes {
    constructor(private controller: IAuthController) {}

    router() {
        const router = Router();
        router.post('/login', validate(loginSchema), asyncHandler(this.controller.login));
        router.get('/me', authMiddleware, asyncHandler(this.controller.me));
        router.post('/logout', asyncHandler(this.controller.logout));
        router.patch(
            '/change-password',
            authMiddleware,
            validate(changePasswordSchema),
            asyncHandler(this.controller.change_password),
        );
        return router;
    }
}
