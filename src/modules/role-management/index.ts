// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRoutes } from './role.route';

export const roleModule: Module = {
    name: 'authentication',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new RoleRepository(database);
        const service = new RoleService(repository, container);
        const controller = new RoleController(service);
        const routes = new RoleRoutes(controller);

        app.use('/roles', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'role' }, 'Role module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'role' }, 'Role module destroyed');
    },
};
