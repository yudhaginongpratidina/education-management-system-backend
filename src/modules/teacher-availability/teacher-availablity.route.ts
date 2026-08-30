import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';

import {
    createAvailabilitySchema,
    updateAvailabilitySchema,
    getAvailabilitySchema,
    deleteAvailabilitySchema,
} from './teacher-availablity.validation';
import type { ITeacherAvailablityController } from './teacher-availablity.interface';

export class TeacherAvailabilityRoutes {
    constructor(private controller: ITeacherAvailablityController) {}

    router() {
        const router = Router();

        router.post(
            '/',
            validate(createAvailabilitySchema),
            asyncHandler(this.controller.create_availability),
        );

        router.get(
            '/:teacher_id',
            validate(getAvailabilitySchema),
            asyncHandler(this.controller.get_availability),
        );

        router.patch(
            '/:teacher_id',
            validate(updateAvailabilitySchema),
            asyncHandler(this.controller.update_availability),
        );

        router.delete(
            '/:teacher_id',
            validate(deleteAvailabilitySchema),
            asyncHandler(this.controller.delete_availability),
        );

        return router;
    }
}
