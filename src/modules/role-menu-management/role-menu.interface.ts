import type { Request, Response, NextFunction } from 'express';

export interface IRoleMenuRepository {
    assign_menu(data: { role_id: number; menu_id: number }): Promise<any>;
    get_role_menus(filter: { role_id?: number; menu_id?: number }): Promise<any>;
    unassign_menu(data: { role_id: number; menu_id: number }): Promise<any>;
    sync_menus(data: { role_id: number; menu_ids: number[] }): Promise<any>;
}

export interface IRoleMenuService {
    assign_menu(data: { role_slug: string; menu_slug: string }): Promise<any>;
    get_role_menus(role_slug: string): Promise<any>;
    unassign_menu(data: { role_slug: string; menu_slug: string }): Promise<any>;
    sync_menus(data: { role_slug: string; menu_slugs: string[] }): Promise<any>;
}

export interface IRoleMenuController {
    assign_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_role_menus(req: Request, res: Response, next: NextFunction): Promise<any>;
    unassign_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
    sync_menus(req: Request, res: Response, next: NextFunction): Promise<any>;
}
