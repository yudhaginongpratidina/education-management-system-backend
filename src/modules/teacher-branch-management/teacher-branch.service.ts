import type { ITeacherBranchRepository, ITeacherBranchService } from './teacher-branch.interface';
import { HttpError } from '../../core/errors/http.error';
import { ErrorCodes } from '../../core/errors/error-codes';

export class TeacherBranchService implements ITeacherBranchService {
    constructor(
        private readonly repository: ITeacherBranchRepository,
        private readonly container: any,
    ) {}

    async asign_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any> {
        const exists = await this.repository.check_teacher_branch_exists(data);
        if (exists) {
            throw new HttpError(
                400,
                'Teacher is already assigned to this branch',
                ErrorCodes.CONFLICT,
                true,
            );
        }
        return await this.repository.asign_teacher_branch(data);
    }

    async get_teacher_branch(data: { teacherId: number }): Promise<any> {
        return await this.repository.get_teacher_branch(data);
    }

    async delete_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any> {
        return await this.repository.delete_teacher_branch(data);
    }
}
