// dependencies
import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';

// validation
import { roleSchema } from './role.validation';

// interface
import type { IRoleController } from './role.interface';

export class RoleRoutes {
    constructor(private controller: IRoleController) {}
    router() {
        const router = Router();

        router.post('/', validate(roleSchema), asyncHandler(this.controller.create_role));
        router.get('/', asyncHandler(this.controller.get_role));
        router.patch('/:slug', validate(roleSchema), asyncHandler(this.controller.update_role));
        router.delete('/:slug', asyncHandler(this.controller.delete_role));

        return router;
    }
}
