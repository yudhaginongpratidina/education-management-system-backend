// dependencies & interfaces
import type { Request, Response, NextFunction } from 'express';
import type { IRoleMenuService, IRoleMenuController } from './role-menu.interface';

export class RoleMenuController implements IRoleMenuController {
    constructor(private readonly service: IRoleMenuService) {}

    assign_menu = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.assign_menu({
                role_slug: req.params.role_slug as string,
                menu_slug: req.body.menu_slug,
            });
            res.status(201).json({ success: true, message: 'Menu assigned', data: response });
        } catch (error) {
            next(error);
        }
    };

    get_role_menus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.get_role_menus(req.params.role_slug as string);
            res.status(200).json({ success: true, message: 'Role menus fetched', data: response });
        } catch (error) {
            next(error);
        }
    };

    unassign_menu = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await this.service.unassign_menu({
                role_slug: req.params.role_slug as string,
                menu_slug: req.params.menu_slug as string,
            });
            res.status(200).json({ success: true, message: 'Menu unassigned' });
        } catch (error) {
            next(error);
        }
    };

    sync_menus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const response = await this.service.sync_menus({
                role_slug: req.params.role_slug as string,
                menu_slugs: req.body.menu_slugs,
            });
            res.status(200).json({ success: true, message: 'Menus synced', data: response });
        } catch (error) {
            next(error);
        }
    };
}
