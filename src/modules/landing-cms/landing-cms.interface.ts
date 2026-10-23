import type { Request, Response, NextFunction } from 'express';

// The landing page sections supported by the CMS. Keeping them in one place
// makes validation, seeding and the OpenAPI docs consistent.
export const LANDING_SECTION_KEYS = [
    'hero',
    'trust',
    'features',
    'about',
    'programs',
    'method',
    'schedule',
    'facilities',
    'pricing',
    'testimonials',
    'branches',
    'faqs',
    'articles',
    'enrollment',
    'footer',
] as const;

export type LandingSectionKey = (typeof LANDING_SECTION_KEYS)[number];

// ============================================================
// REPOSITORY
// ============================================================
export interface ILandingCmsRepository {
    findAll(activeOnly?: boolean): Promise<any[]>;
    findByKey(key: string): Promise<any | null>;
    upsert(
        key: string,
        contentJson: string,
        isActive: boolean,
        updatedBy?: number | null,
    ): Promise<any>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
}

// ============================================================
// SERVICE
// ============================================================
export interface ILandingCmsService {
    // Public payload: { hero: {...}, trust: [...], ... } (active sections only).
    getPublicContent(): Promise<Record<string, any>>;
    getSections(): Promise<any[]>;
    getSection(key: string): Promise<any>;
    upsertSection(
        key: string,
        content: any,
        isActive: boolean,
        userId?: number | null,
    ): Promise<any>;
    bulkUpsert(
        sections: { key: string; content: any; is_active?: boolean }[],
        userId?: number | null,
    ): Promise<any[]>;
    deleteSection(key: string): Promise<void>;
    reset(): Promise<void>;
}

// ============================================================
// CONTROLLER
// ============================================================
export interface ILandingCmsController {
    getPublicContent(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSections(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSection(req: Request, res: Response, next: NextFunction): Promise<void>;
    upsertSection(req: Request, res: Response, next: NextFunction): Promise<void>;
    bulkUpsert(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteSection(req: Request, res: Response, next: NextFunction): Promise<void>;
    reset(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
}
