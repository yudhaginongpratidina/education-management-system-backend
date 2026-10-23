import { Router } from 'express';
import multer from 'multer';
import type { StudentController } from './student.controller';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { createStudentSchema, updateStudentSchema } from './student.validation';

// Use memory storage so we can process Excel buffers directly without disk I/O
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

export class StudentRoutes {
    constructor(private readonly studentController: StudentController) {}

    router(): Router {
        const router = Router();

        router.get('/', asyncHandler(this.studentController.findAll));
        router.get('/export', asyncHandler(this.studentController.export));
        router.get('/template', asyncHandler(this.studentController.template));

        router.post(
            '/import/preview',
            upload.single('file'),
            asyncHandler(this.studentController.previewImport),
        );

        router.post(
            '/import',
            upload.single('file'),
            asyncHandler(this.studentController.import),
        );

        router.post('/assign', asyncHandler(this.studentController.assign));

        router.get('/:id', asyncHandler(this.studentController.findById));
        router.post(
            '/',
            validate(createStudentSchema),
            asyncHandler(this.studentController.create),
        );
        router.put(
            '/:id',
            validate(updateStudentSchema),
            asyncHandler(this.studentController.update),
        );
        router.delete('/:id', asyncHandler(this.studentController.delete));

        return router;
    }
}
