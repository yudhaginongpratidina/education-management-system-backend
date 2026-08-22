import type { Request, Response, NextFunction } from 'express';

export interface IMenuRepository {
    create_menu(data: {
        parent_id?: number | null;
        name: string;
        slug: string;
        type: 'GROUP' | 'ITEM';
        icon?: string | null;
        url?: string | null;
        description?: string | null;
        sort_order?: number;
        is_active?: boolean;
    }): Promise<any>;

    get_menu(
        filter: {
            id?: number;
            parent_id?: number | null;
            name?: string;
            slug?: string;
            type?: 'GROUP' | 'ITEM';
            is_active?: boolean;
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_menu(data: {
        id: number;
        parent_id?: number | null;
        name: string;
        slug: string;
        type: 'GROUP' | 'ITEM';
        icon?: string | null;
        url?: string | null;
        description?: string | null;
        sort_order?: number;
        is_active?: boolean;
    }): Promise<any>;

    delete_menu(slug: string): Promise<any>;
}

export interface IMenuService {
    create_menu(data: {
        parent_id?: number | null;
        name: string;
        type: 'GROUP' | 'ITEM';
        icon?: string | null;
        url?: string | null;
        description?: string | null;
        sort_order?: number;
        is_active?: boolean;
    }): Promise<any>;

    get_menu(
        filter: {
            id?: number;
            parent_id?: number | null;
            name?: string;
            slug?: string;
            type?: 'GROUP' | 'ITEM';
            is_active?: boolean;
        },
        pagination?: {
            limit: number;
            offset: number;
        },
    ): Promise<any>;

    update_menu(data: {
        name: string;
        slug: string;
        parent_id?: number | null;
        type: 'GROUP' | 'ITEM';
        icon?: string | null;
        url?: string | null;
        description?: string | null;
        sort_order?: number;
        is_active?: boolean;
    }): Promise<any>;

    delete_menu(slug: string): Promise<any>;
}

export interface IMenuController {
    create_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
    update_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
    delete_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
}
