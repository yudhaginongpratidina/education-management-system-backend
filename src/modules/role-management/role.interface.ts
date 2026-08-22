import type { Request, Response, NextFunction } from 'express';

export interface IRoleRepository {
    create_role(data: { name: string; slug: string; description: string }): Promise<any>;
    get_role(
        filter: { id?: number; name?: string; slug?: string },
        pagination?: { limit: number; offset: number },
    ): Promise<any>;
    update_role(data: {
        id: number;
        name: string;
        slug: string;
        description: string;
    }): Promise<any>;
    delete_role(slug: string): Promise<any>;
}

export interface IRoleService {
    create_role(data: { name: string; description: string }): Promise<any>;
    get_role(
        filter: { id?: number; name?: string; slug?: string },
        pagination?: { limit: number; offset: number },
    ): Promise<any>;
    update_role(data: { name: string; slug: string; description: string }): Promise<any>;
    delete_role(slug: string): Promise<any>;
}

export interface IRoleController {
    create_role(req: Request, res: Response, next: NextFunction): Promise<any>;
    update_role(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_role(req: Request, res: Response, next: NextFunction): Promise<any>;
    delete_role(req: Request, res: Response, next: NextFunction): Promise<any>;
}
