import type { Request, Response, NextFunction } from 'express';

export interface IUserRepository {
    create_user(data: {
        full_name: string;
        slug: string;
        email: string;
        password_hash: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any>;
    get_user(
        filter: {
            id?: number;
            slug?: string;
            email?: string;
            role?: string | null;
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;
    update_user(data: {
        id: number;
        full_name: string;
        slug: string;
        email: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any>;
    update_password(data: { id: number; password_hash: string }): Promise<any>;
    delete_user(slug: string): Promise<any>;
}

export interface IUserService {
    create_user(data: {
        full_name: string;
        slug: string;
        email: string;
        password_hash: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any>;
    get_user(
        filter: {
            id?: number;
            slug?: string;
            email?: string;
            role?: string | null;
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;
    update_user(data: {
        id: number;
        full_name: string;
        slug: string;
        email: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any>;
    update_password(data: { id: number; password_hash: string }): Promise<any>;
    delete_user(slug: string): Promise<any>;
}

export interface IUserController {
    create_user(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_users(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_user(req: Request, res: Response, next: NextFunction): Promise<any>;
    update_user(req: Request, res: Response, next: NextFunction): Promise<any>;
    delete_user(req: Request, res: Response, next: NextFunction): Promise<any>;
}
