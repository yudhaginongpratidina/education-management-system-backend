import type { Express } from 'express';
import type { Module } from '../../core/module';

import { SessionRescheduleRepository } from './session-reschedule.repository';
import { SessionRescheduleService } from './session-reschedule.service';
import { SessionRescheduleController } from './session-reschedule.controller';
import { SessionRescheduleRoutes } from './session-reschedule.route';

export { SessionRescheduleRepository };

export const sessionRescheduleModule: Module = {
    name: 'session-reschedule',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new SessionRescheduleRepository(database);
        const service = new SessionRescheduleService(repository);
        const controller = new SessionRescheduleController(service);
        const routes = new SessionRescheduleRoutes(controller);

        app.use('/session-reschedules', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'session-reschedule' },
            'Session reschedule module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'session-reschedule' },
            'Session reschedule module destroyed',
        );
    },
};
