import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';

import { getStorageSchema, deleteStorageSchema } from './storage.validation';
import type { IStorageController } from './storage.interface';

const upload = multer({ dest: 'uploads/' });

export class StorageRoutes {
    constructor(private controller: IStorageController) {}

    router() {
        const router = Router();

        router.post(
            '/',
            // authMiddleware,
            upload.single('file'),
            asyncHandler(this.controller.upload),
        );

        router.get(
            '/backup',
            // authMiddleware,
            asyncHandler(this.controller.backup),
        );

        router.post(
            '/restore',
            // authMiddleware,
            upload.single('zipFile'),
            asyncHandler(this.controller.restore),
        );

        router.get(
            '/:slug',
            // authMiddleware,
            validate(getStorageSchema),
            asyncHandler(this.controller.get),
        );

        router.delete(
            '/:slug',
            // authMiddleware,
            validate(deleteStorageSchema),
            asyncHandler(this.controller.delete),
        );

        return router;
    }
}
