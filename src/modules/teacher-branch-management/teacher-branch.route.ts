import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import { assignTeacherBranchSchema } from './teacher-branch.validation';
import type { ITeacherBranchController } from './teacher-branch.interface';

export class TeacherBranchRoutes {
    constructor(private controller: ITeacherBranchController) {}

    router() {
        const router = Router();

        router.post(
            '/',
            validate(assignTeacherBranchSchema),
            asyncHandler(this.controller.asign_teacher_branch),
        );
        router.get('/:teacherId', asyncHandler(this.controller.get_teacher_branch));
        router.delete('/:teacherId/:branchId', asyncHandler(this.controller.delete_teacher_branch));

        return router;
    }
}
