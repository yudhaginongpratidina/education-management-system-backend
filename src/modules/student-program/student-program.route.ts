import { Router } from 'express';
import type { StudentProgramController } from './student-program.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import {
    createStudentProgramSchema,
    updateStudentProgramSchema,
} from './student-program.validation';

export class StudentProgramRoutes {
    constructor(private readonly controller: StudentProgramController) {}

    router(): Router {
        const router = Router();
        router.get('/', this.controller.findAll);
        router.get('/:id', this.controller.findById);
        router.post('/', validate(createStudentProgramSchema), this.controller.create);
        router.put('/:id', validate(updateStudentProgramSchema), this.controller.update);
        router.delete('/:id', this.controller.delete);
        return router;
    }
}
