// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRoutes } from './auth.route';

export const authModule: Module = {
    name: 'authentication',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new AuthRepository(database);
        const service = new AuthService(repository, container);
        const controller = new AuthController(service);
        const routes = new AuthRoutes(controller);

        app.use('/auth', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'authentication' }, 'Authentication module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'authentication' }, 'Authentication module destroyed');
    },
};
