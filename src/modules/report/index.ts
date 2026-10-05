import type { Express } from 'express';
import type { Module } from '../../core/module';

import { ReportRepository } from './report.repository';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportRoutes } from './report.route';

export const reportModule: Module = {
    name: 'report',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new ReportRepository(database);
        const service = new ReportService(repository);
        const controller = new ReportController(service);
        const routes = new ReportRoutes(controller);

        app.use('/reports', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'report' }, 'Report module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'report' }, 'Report module destroyed');
    },
};
