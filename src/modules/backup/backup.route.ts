import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import { asyncHandler } from '../../core/http/async-handler';
import authMiddleware from '../../shared/middleware/auth.middleware';
import type { BackupController } from './backup.controller';

const upload = multer({
    dest: os.tmpdir(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB max
    },
});

export class BackupRoutes {
    constructor(private readonly controller: BackupController) {}

    router(): Router {
        const router = Router();

        router.get('/status', authMiddleware, asyncHandler(this.controller.getStatus));
        router.get('/database', authMiddleware, asyncHandler(this.controller.exportDatabase));
        router.post(
            '/database/import',
            authMiddleware,
            upload.single('file'),
            asyncHandler(this.controller.importDatabase),
        );
        router.get('/uploads', authMiddleware, asyncHandler(this.controller.exportUploads));
        router.post(
            '/uploads/import',
            authMiddleware,
            upload.single('file'),
            asyncHandler(this.controller.importUploads),
        );

        return router;
    }
}
