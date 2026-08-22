// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { MenuRepository } from './menu.repository';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuRoutes } from './menu.route';

export const menuModule: Module = {
    name: 'menu',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new MenuRepository(database);
        const service = new MenuService(repository, container);
        const controller = new MenuController(service);
        const routes = new MenuRoutes(controller);

        app.use('/menus', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'menu' }, 'Menu module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'menu' }, 'Menu module destroyed');
    },
};
