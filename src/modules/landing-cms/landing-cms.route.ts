import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import {
    bulkUpsertSectionsSchema,
    sectionKeyParamsSchema,
    upsertSectionSchema,
} from './landing-cms.validation';
import type { ILandingCmsController } from './landing-cms.interface';

export class LandingCmsRoutes {
    constructor(private readonly controller: ILandingCmsController) {}

    router(): Router {
        const router = Router();

        // ---------- public (consumed by the public landing page) ----------
        router.get('/content', asyncHandler(this.controller.getPublicContent));

        // ---------- admin (requires authentication) ----------
        router.use(authMiddleware);

        router.get('/sections', asyncHandler(this.controller.getSections));
        router.put(
            '/sections',
            validate(bulkUpsertSectionsSchema),
            asyncHandler(this.controller.bulkUpsert),
        );
        router.post('/sections/reset', asyncHandler(this.controller.reset));
        router.get(
            '/sections/:key',
            validate(sectionKeyParamsSchema),
            asyncHandler(this.controller.getSection),
        );
        router.put(
            '/sections/:key',
            validate(upsertSectionSchema),
            asyncHandler(this.controller.upsertSection),
        );
        router.delete(
            '/sections/:key',
            validate(sectionKeyParamsSchema),
            asyncHandler(this.controller.deleteSection),
        );

        return router;
    }
}
