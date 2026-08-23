import type { Request, Response, NextFunction } from 'express';

export interface IProgramLevelRepository {
    create_level(data: {
        program_id: number;
        level: number;
        name: string;
        description?: string | null;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    get_levels(
        filter: {
            id?: number;
            program_id?: number;
            level?: number;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_level(data: {
        id: number;
        level: number;
        name: string;
        description?: string | null;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    delete_level(data: { program_id: number; level: number }): Promise<any>;
}

export interface IProgramLevelService {
    create_level(data: {
        program_slug: string;
        level: number;
        name: string;
        description?: string;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    get_levels(
        program_slug: string,
        filter?: {
            level?: number;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_level(data: {
        program_slug: string;
        level: number;
        name: string;
        description?: string;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    delete_level(data: { program_slug: string; level: number }): Promise<any>;
}

export interface IProgramLevelController {
    create_level(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_levels(req: Request, res: Response, next: NextFunction): Promise<any>;
    update_level(req: Request, res: Response, next: NextFunction): Promise<any>;
    delete_level(req: Request, res: Response, next: NextFunction): Promise<any>;
}
