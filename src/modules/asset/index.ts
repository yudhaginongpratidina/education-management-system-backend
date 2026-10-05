import type { Express } from 'express';
import type { Module } from '../../core/module';

import { AssetRepository } from './asset.repository';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AssetRoutes } from './asset.route';

export const assetModule: Module = {
    name: 'asset',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new AssetRepository(database);
        const service = new AssetService(repository);
        const controller = new AssetController(service);
        const routes = new AssetRoutes(controller);

        app.use('/asset-categories', routes.categoryRouter());
        app.use('/assets', routes.assetRouter());
    },

    async onInit(container) {
        container.logger.info({ module: 'asset' }, 'Asset module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'asset' }, 'Asset module destroyed');
    },
};
