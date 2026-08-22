import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from './user.validation';

// interface
import type { IUserController } from './user.interface';

export class UserRoutes {
    constructor(private controller: IUserController) {}

    router() {
        const router = Router();

        router.get('/', asyncHandler(this.controller.get_users));
        router.get('/:slug', asyncHandler(this.controller.get_user));
        router.post('/', validate(createUserSchema), asyncHandler(this.controller.create_user));
        router.patch('/:id', validate(updateUserSchema), asyncHandler(this.controller.update_user));
        router.delete('/:slug', asyncHandler(this.controller.delete_user));

        return router;
    }
}
