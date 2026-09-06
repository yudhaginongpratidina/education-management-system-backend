import type { Request, Response, NextFunction } from 'express';

export interface ITeacherBranchRepository {
    asign_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any>;
    check_teacher_branch_exists(data: { teacherId: number; branchId: number }): Promise<boolean>;
    get_teacher_branch(data: { teacherId: number }): Promise<any>;
    delete_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any>;
}

export interface ITeacherBranchService {
    asign_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any>;
    get_teacher_branch(data: { teacherId: number }): Promise<any>;
    delete_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any>;
}

export interface ITeacherBranchController {
    asign_teacher_branch(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_teacher_branch(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete_teacher_branch(req: Request, res: Response, next: NextFunction): Promise<void>;
}
