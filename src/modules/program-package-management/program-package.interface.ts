import type { Request, Response, NextFunction } from 'express';

export interface IProgramPackageRepository {
    create_package(data: {
        program_id: number;
        name: string;
        slug: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months: number;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    get_packages(
        filter: {
            id?: number;
            program_id?: number;
            slug?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_package(data: {
        old_slug: string;
        new_slug: string;
        program_id: number;
        name: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months: number;
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    delete_package(slug: string): Promise<any>;
}

export interface IProgramPackageService {
    create_package(data: {
        program_slug: string;
        name: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months?: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    get_packages(
        program_slug: string,
        filter?: {
            slug?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_package(data: {
        slug: string;
        name: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months?: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any>;

    delete_package(slug: string): Promise<any>;
}

export interface IProgramPackageController {
    create_package(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_packages(req: Request, res: Response, next: NextFunction): Promise<any>;
    update_package(req: Request, res: Response, next: NextFunction): Promise<any>;
    delete_package(req: Request, res: Response, next: NextFunction): Promise<any>;
}
