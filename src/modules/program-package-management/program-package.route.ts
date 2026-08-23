import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { programPackageSchema } from './program-package.validation';

// interface
import type { IProgramPackageController } from './program-package.interface';

export class ProgramPackageRoutes {
    constructor(private controller: IProgramPackageController) {}

    router() {
        const router = Router();

        router.get('/:program_slug', asyncHandler(this.controller.get_packages));
        router.post(
            '/:program_slug',
            validate(programPackageSchema),
            asyncHandler(this.controller.create_package),
        );
        router.patch(
            '/:slug',
            validate(programPackageSchema),
            asyncHandler(this.controller.update_package),
        );
        router.delete('/:slug', asyncHandler(this.controller.delete_package));

        return router;
    }
}
