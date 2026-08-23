// dependencies
import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';

// validation
import { loginSchema } from './auth.validation';

// interface
import type { IAuthController } from './auth.interface';

export class AuthRoutes {
    constructor(private controller: IAuthController) {}

    router() {
        const router = Router();
        router.post('/login', validate(loginSchema), asyncHandler(this.controller.login));
        return router;
    }
}
