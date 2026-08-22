// dependencies
import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';

// validation
import { menuSchema } from './menu.validation';

// interface
import type { IMenuController } from './menu.interface';

export class MenuRoutes {
    constructor(private controller: IMenuController) {}

    router() {
        const router = Router();

        router.get('/', asyncHandler(this.controller.get_menu));
        router.post('/', validate(menuSchema), asyncHandler(this.controller.create_menu));
        router.patch('/:slug', validate(menuSchema), asyncHandler(this.controller.update_menu));
        router.delete('/:slug', asyncHandler(this.controller.delete_menu));

        return router;
    }
}
