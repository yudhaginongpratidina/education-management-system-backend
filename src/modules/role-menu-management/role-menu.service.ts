// core
import { HttpError } from '../../core/errors/http.error';

// interface
import type { IRoleMenuRepository, IRoleMenuService } from './role-menu.interface';
import type { IRoleRepository } from '../role-management/role.interface';
import type { IMenuRepository } from '../menu-management/menu.interface';

export class RoleMenuService implements IRoleMenuService {
    constructor(
        private repo: IRoleMenuRepository,
        private roleRepo: IRoleRepository,
        private menuRepo: IMenuRepository,
        private container: any,
    ) {}

    private async get_role_and_menu(role_slug: string, menu_slug: string) {
        const roles = await this.roleRepo.get_role({ slug: role_slug });
        const menus = await this.menuRepo.get_menu({ slug: menu_slug });

        if (roles.length === 0) throw new HttpError(404, 'Role not found', 'ROLE_NOT_FOUND', true);
        if (menus.length === 0) throw new HttpError(404, 'Menu not found', 'MENU_NOT_FOUND', true);

        return { role: roles[0], menu: menus[0] };
    }

    async assign_menu(data: { role_slug: string; menu_slug: string }): Promise<any> {
        const { role, menu } = await this.get_role_and_menu(data.role_slug, data.menu_slug);

        const existing = await this.repo.get_role_menus({ role_id: role.id, menu_id: menu.id });
        if (existing.length > 0)
            throw new HttpError(
                400,
                'Menu already assigned to role',
                'MENU_ALREADY_ASSIGNED',
                true,
            );

        return await this.repo.assign_menu({ role_id: role.id, menu_id: menu.id });
    }

    async get_role_menus(role_slug: string): Promise<any> {
        const roles = await this.roleRepo.get_role({ slug: role_slug });
        if (roles.length === 0) throw new HttpError(404, 'Role not found', 'ROLE_NOT_FOUND', true);

        const role_menus = await this.repo.get_role_menus({ role_id: roles[0].id });
        const menus = await Promise.all(
            role_menus.map((rm: any) => this.menuRepo.get_menu({ id: rm.menu_id })),
        );

        return menus.flat();
    }

    async unassign_menu(data: { role_slug: string; menu_slug: string }): Promise<any> {
        const { role, menu } = await this.get_role_and_menu(data.role_slug, data.menu_slug);
        return await this.repo.unassign_menu({ role_id: role.id, menu_id: menu.id });
    }

    async sync_menus(data: { role_slug: string; menu_slugs: string[] }): Promise<any> {
        const roles = await this.roleRepo.get_role({ slug: data.role_slug });
        if (roles.length === 0) throw new HttpError(404, 'Role not found', 'ROLE_NOT_FOUND', true);

        const menus = await Promise.all(
            data.menu_slugs.map((slug) => this.menuRepo.get_menu({ slug })),
        );

        const menu_ids = menus.flat().map((m) => m.id);
        return await this.repo.sync_menus({ role_id: roles[0].id, menu_ids });
    }
}
