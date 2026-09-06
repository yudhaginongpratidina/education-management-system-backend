import type { Request, Response, NextFunction } from 'express';
import type { ITeacherBranchService, ITeacherBranchController } from './teacher-branch.interface';

export class TeacherBranchController implements ITeacherBranchController {
    constructor(private readonly service: ITeacherBranchService) {}

    asign_teacher_branch = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const data = {
                teacherId: parseInt(req.body.teacherId),
                branchId: parseInt(req.body.branchId),
            };
            const response = await this.service.asign_teacher_branch(data);
            res.status(201).json({
                success: true,
                message: 'Teacher assigned to branch',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    get_teacher_branch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teacherId = parseInt(req.params.teacherId);
            const response = await this.service.get_teacher_branch({ teacherId });
            res.status(200).json({
                success: true,
                message: 'Teacher branches fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    };

    delete_teacher_branch = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const data = {
                teacherId: parseInt(req.params.teacherId),
                branchId: parseInt(req.params.branchId),
            };
            await this.service.delete_teacher_branch(data);
            res.status(200).json({ success: true, message: 'Teacher removed from branch' });
        } catch (error) {
            next(error);
        }
    };
}
