import type { Request, Response, NextFunction } from 'express';

export interface ITeacherRepository {
    create_teacher(data: {
        full_name: string;
        slug: string;
        user_id: string;
        phone_number: string;
        address: string;
        place_and_dob: string;
        last_education: string;
        position: string;
        photo: string;
        still_actively_working: boolean;
    }): Promise<any>;
    get_teacher(filter: {
        id?: number;
        full_name?: string;
        slug?: string;
        phone_number?: string;
    }): Promise<any>;
    update_teacher(data: {
        id: number;
        full_name: string;
        slug: string;
        user_id?: string;
        phone_number: string | null;
        address: string | null;
        place_and_dob: string | null;
        last_education: string | null;
        position: string | null;
        photo: string | null;
        still_actively_working: boolean;
    }): Promise<any>;
    delete_teacher(slug: string): Promise<any>;
}

export interface ITeacherService {
    create_teacher(data: {
        full_name: string;
        slug: string;
        user_id: string;
        phone_number: string;
        address: string;
        place_and_dob: string;
        last_education: string;
        position: string;
        photo: string;
        still_actively_working: boolean;
    }): Promise<any>;
    get_teacher(filter: {
        id?: number;
        full_name?: string;
        slug?: string;
        phone_number?: string;
    }): Promise<any>;
    update_teacher(data: {
        id: number;
        full_name: string;
        slug: string;
        user_id?: string;
        phone_number: string | null;
        address: string | null;
        place_and_dob: string | null;
        last_education: string | null;
        position: string | null;
        photo: string | null;
        still_actively_working: boolean;
    }): Promise<any>;
    delete_teacher(slug: string): Promise<any>;
}

export interface ITeacherController {
    create_teacher(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_teacher(req: Request, res: Response, next: NextFunction): Promise<void>;
    update_teacher(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete_teacher(req: Request, res: Response, next: NextFunction): Promise<void>;
}
