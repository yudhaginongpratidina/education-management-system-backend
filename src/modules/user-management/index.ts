// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRoutes } from './user.route';

export const userModule: Module = {
    name: 'user-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new UserRepository(database);
        const service = new UserService(repository, container);
        const controller = new UserController(service);
        const routes = new UserRoutes(controller);

        app.use('/users', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'user-management' }, 'User module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'user-management' }, 'User module destroyed');
    },
};
