import type { Express } from 'express';
import type { Module } from '../../core/module';

import { LandingCmsRepository } from './landing-cms.repository';
import { LandingCmsService } from './landing-cms.service';
import { LandingCmsController } from './landing-cms.controller';
import { LandingCmsRoutes } from './landing-cms.route';

export const landingCmsModule: Module = {
    name: 'landing-cms',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new LandingCmsRepository(database);
        const service = new LandingCmsService(repository);
        const controller = new LandingCmsController(service);
        const routes = new LandingCmsRoutes(controller);

        app.use('/landing', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'landing-cms' }, 'Landing CMS module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'landing-cms' }, 'Landing CMS module destroyed');
    },
};
