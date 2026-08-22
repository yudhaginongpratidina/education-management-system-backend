// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { RoleMenuRepository } from './role-menu.repository';
import { RoleRepository } from '../role-management/role.repository';
import { MenuRepository } from '../menu-management/menu.repository';

import { RoleMenuService } from './role-menu.service';
import { RoleMenuController } from './role-menu.controller';
import { RoleMenuRoutes } from './role-menu.route';

export const roleMenuModule: Module = {
    name: 'role-menu',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const role_menu_repository = new RoleMenuRepository(database);
        const role_repository = new RoleRepository(database);
        const menu_repository = new MenuRepository(database);

        const service = new RoleMenuService(
            role_menu_repository,
            role_repository,
            menu_repository,
            container,
        );
        const controller = new RoleMenuController(service);
        const routes = new RoleMenuRoutes(controller);

        app.use('/role-menus', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'role-menu' }, 'Role menu module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'role-menu' }, 'Role menu module destroyed');
    },
};
