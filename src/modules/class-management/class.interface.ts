import type { Request, Response, NextFunction } from 'express';
import type { ClassStatus, Pagination } from '../../shared/class/class.types';

export interface ClassListFilter {
    branch_id?: number;
    status?: ClassStatus;
    search?: string;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

// ============================================================
// CLASS REPOSITORY / SERVICE / CONTROLLER
// ============================================================
export interface IClassRepository {
    create(data: {
        branch_id: number;
        name: string;
        code: string;
        description?: string | null;
        status?: ClassStatus;
    }): Promise<any>;
    findAll(filter: ClassListFilter, pagination?: Pagination): Promise<any>;
    findById(id: number): Promise<any>;
    findByCode(code: string, excludeId?: number): Promise<any>;
    update(
        id: number,
        data: {
            branch_id?: number;
            name?: string;
            code?: string;
            description?: string | null;
            status?: ClassStatus;
        },
    ): Promise<any>;
    delete(id: number): Promise<void>;
    branchExists(branchId: number): Promise<boolean>;
}

export interface IClassService {
    createClass(data: {
        branch_id: number;
        name: string;
        code: string;
        description?: string | null;
        status?: ClassStatus;
    }): Promise<any>;
    getClasses(filter: ClassListFilter, pagination?: Pagination): Promise<any>;
    getClassById(id: number): Promise<any>;
    updateClass(id: number, data: any): Promise<any>;
    deleteClass(id: number): Promise<void>;
}

export interface IClassController {
    createClass(req: Request, res: Response, next: NextFunction): Promise<void>;
    getClasses(req: Request, res: Response, next: NextFunction): Promise<void>;
    getClass(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateClass(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteClass(req: Request, res: Response, next: NextFunction): Promise<void>;
}
