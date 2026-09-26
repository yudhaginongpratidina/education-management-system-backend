import { Router } from 'express';
import type { StudentController } from './student.controller';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { createStudentSchema, updateStudentSchema } from './student.validation';

export class StudentRoutes {
    constructor(private readonly studentController: StudentController) {}

    router(): Router {
        const router = Router();
        router.get('/', asyncHandler(this.studentController.findAll));
        router.get('/export', asyncHandler(this.studentController.export));
        router.post('/import', asyncHandler(this.studentController.import));
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
