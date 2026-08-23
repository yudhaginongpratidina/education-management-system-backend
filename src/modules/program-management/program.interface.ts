import type { Request, Response, NextFunction } from 'express';

export interface IProgramRepository {
    create_program(data: {
        name: string;
        slug: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    get_program(
        filter: {
            id?: number;
            slug?: string;
            name?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_program(data: {
        old_slug: string;
        new_slug: string;
        name: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    delete_program(slug: string): Promise<any>;
}

export interface IProgramService {
    create_program(data: {
        name: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    get_program(
        filter: {
            id?: number;
            slug?: string;
            name?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_program(data: {
        slug: string;
        name: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    delete_program(slug: string): Promise<any>;
}

export interface IProgramController {
    create_program(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_programs(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_program(req: Request, res: Response, next: NextFunction): Promise<any>;
    update_program(req: Request, res: Response, next: NextFunction): Promise<any>;
    delete_program(req: Request, res: Response, next: NextFunction): Promise<any>;
}
