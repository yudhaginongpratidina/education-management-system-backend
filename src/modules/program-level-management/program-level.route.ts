import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { programLevelSchema } from './program-level.validation';

// interface
import type { IProgramLevelController } from './prorgam-level.interface';

export class ProgramLevelRoutes {
    constructor(private controller: IProgramLevelController) {}

    router() {
        const router = Router();

        router.get('/:program_slug', asyncHandler(this.controller.get_levels));
        router.post(
            '/:program_slug',
            validate(programLevelSchema),
            asyncHandler(this.controller.create_level),
        );
        router.patch(
            '/:program_slug/:level',
            validate(programLevelSchema),
            asyncHandler(this.controller.update_level),
        );
        router.delete('/:program_slug/:level', asyncHandler(this.controller.delete_level));

        return router;
    }
}
