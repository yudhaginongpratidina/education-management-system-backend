import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { createBranchSchema, updateBranchSchema } from './branch.validation';
import type { IBranchController } from './branch.interface';

export class BranchRoutes {
    constructor(private controller: IBranchController) {}

    router() {
        const router = Router();

        router.get('/', asyncHandler(this.controller.get_branches));
        router.get('/:slug', asyncHandler(this.controller.get_branch));
        router.post('/', validate(createBranchSchema), asyncHandler(this.controller.create_branch));
        router.patch(
            '/:id',
            validate(updateBranchSchema),
            asyncHandler(this.controller.update_branch),
        );
        router.delete('/:slug', asyncHandler(this.controller.delete_branch));

        return router;
    }
}
