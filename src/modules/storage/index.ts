// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { StorageRepository } from './storage.repository';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { StorageRoutes } from './storage.route';

export const storageModule: Module = {
    name: 'storage',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new StorageRepository(database);
        const service = new StorageService(repository);
        const controller = new StorageController(service);
        const routes = new StorageRoutes(controller);

        app.use('/storage', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'storage' }, 'Storage module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'storage' }, 'Storage module destroyed');
    },
};
