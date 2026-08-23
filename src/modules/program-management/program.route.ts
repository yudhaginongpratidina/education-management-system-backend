import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { programSchema } from './program.validation';

// interface
import type { IProgramController } from './program.interface';

export class ProgramRoutes {
    constructor(private controller: IProgramController) {}

    router() {
        const router = Router();

        router.get('/', asyncHandler(this.controller.get_programs));
        router.get('/:slug', asyncHandler(this.controller.get_program));
        router.post('/', validate(programSchema), asyncHandler(this.controller.create_program));
        router.patch(
            '/:slug',
            validate(programSchema),
            asyncHandler(this.controller.update_program),
        );
        router.delete('/:slug', asyncHandler(this.controller.delete_program));

        return router;
    }
}
