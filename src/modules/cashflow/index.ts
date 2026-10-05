import type { Express } from 'express';
import type { Module } from '../../core/module';

import { CashflowRepository } from './cashflow.repository';
import { CashflowService } from './cashflow.service';
import { CashflowController } from './cashflow.controller';
import { CashflowRoutes } from './cashflow.route';

export const cashflowModule: Module = {
    name: 'cashflow',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new CashflowRepository(database);
        const service = new CashflowService(repository);
        const controller = new CashflowController(service);
        const routes = new CashflowRoutes(controller);

        app.use('/cashflow', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'cashflow' }, 'Cashflow module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'cashflow' }, 'Cashflow module destroyed');
    },
};
