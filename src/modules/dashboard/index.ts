// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardRoutes } from './dashboard.route';

export const dashboardModule: Module = {
    name: 'dashboard',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new DashboardRepository(database);
        const service = new DashboardService(repository);
        const controller = new DashboardController(service);
        const routes = new DashboardRoutes(controller);

        app.use('/dashboard', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'dashboard' }, 'Dashboard module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'dashboard' }, 'Dashboard module destroyed');
    },
};
