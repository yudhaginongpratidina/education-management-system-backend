import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import {
    createClassSchema,
    getClassSchema,
    listClassSchema,
    updateClassSchema,
} from './class.validation';
import type { IClassController } from './class.interface';

export class ClassRoutes {
    constructor(private readonly controller: IClassController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        // ---------- classes ----------
        router.get('/', validate(listClassSchema), asyncHandler(this.controller.getClasses));
        router.post('/', validate(createClassSchema), asyncHandler(this.controller.createClass));

        // ---------- class by id ----------
        router.get('/:id', validate(getClassSchema), asyncHandler(this.controller.getClass));
        router.put('/:id', validate(updateClassSchema), asyncHandler(this.controller.updateClass));
        router.delete('/:id', validate(getClassSchema), asyncHandler(this.controller.deleteClass));

        return router;
    }
}
