import type { Express } from 'express';
import type { Module } from '../../core/module';

import { ThemeRepository } from './theme.repository';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { ThemeRoutes } from './theme.route';
import { StorageRepository } from '../storage/storage.repository';
import { StorageService } from '../storage/storage.service';

export const themeModule: Module = {
    name: 'theme',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new ThemeRepository(database);
        const service = new ThemeService(repository);
        const storageRepository = new StorageRepository(database);
        const storageService = new StorageService(storageRepository);
        const controller = new ThemeController(service, storageService);
        const routes = new ThemeRoutes(controller);

        app.use('/theme', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'theme' }, 'Theme module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'theme' }, 'Theme module destroyed');
    },
};
