import type { Request, Response, NextFunction } from 'express';

export interface IBranchRepository {
    create_branch(data: {
        name: string;
        slug: string;
        address?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        radius?: string | null;
    }): Promise<any>;
    get_branch(filter?: { id?: number; name?: string; slug?: string }): Promise<any>;
    update_branch(data: {
        id: number;
        name?: string;
        slug?: string;
        address?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        radius?: string | null;
    }): Promise<any>;
    delete_branch(slug: string): Promise<any>;
}

export interface IBranchService {
    create_branch(data: {
        name: string;
        address?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        radius?: string | null;
    }): Promise<any>;
    get_branches(): Promise<any>;
    get_branch(filter: { id?: number; name?: string; slug?: string }): Promise<any>;
    update_branch(data: {
        id: number;
        name?: string;
        address?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        radius?: string | null;
    }): Promise<any>;
    delete_branch(slug: string): Promise<any>;
}

export interface IBranchController {
    create_branch(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_branches(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_branch(req: Request, res: Response, next: NextFunction): Promise<void>;
    update_branch(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete_branch(req: Request, res: Response, next: NextFunction): Promise<void>;
}
