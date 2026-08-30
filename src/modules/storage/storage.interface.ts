import type { Request, Response, NextFunction } from 'express';

export interface IStorage {
    id: number;
    original_name: string;
    slug: string;
    mime_type: string;
    extension: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface IStorageRepository {
    upload(data: {
        original_name: string;
        slug: string;
        mime_type: string;
        extension: string | null;
    }): Promise<IStorage>;
    get(slug: string): Promise<IStorage | null>;
    delete(slug: string): Promise<void>;
}

export interface IStorageService {
    upload(file: Express.Multer.File): Promise<IStorage>;
    get(slug: string): Promise<IStorage>;
    delete(slug: string): Promise<void>;
}

export interface IStorageController {
    upload(req: Request, res: Response, next: NextFunction): Promise<void>;
    get(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
