// dependencies
import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';

// validation
import { roleMenuSchema, syncMenuSchema } from './role-menu.validation';

// interface
import type { IRoleMenuController } from './role-menu.interface';

export class RoleMenuRoutes {
    constructor(private controller: IRoleMenuController) {}

    router() {
        const router = Router();

        router.get('/:role_slug', asyncHandler(this.controller.get_role_menus));
        router.post(
            '/:role_slug/assign',
            validate(roleMenuSchema),
            asyncHandler(this.controller.assign_menu),
        );
        router.post(
            '/:role_slug/sync',
            validate(syncMenuSchema),
            asyncHandler(this.controller.sync_menus),
        );
        router.delete(
            '/:role_slug/unassign/:menu_slug',
            asyncHandler(this.controller.unassign_menu),
        );

        return router;
    }
}
