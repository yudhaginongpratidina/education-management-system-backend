// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { ProgramRepository } from './program.repository';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { ProgramRoutes } from './program.route';

export const programModule: Module = {
    name: 'program-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new ProgramRepository(database);
        const service = new ProgramService(repository, container);
        const controller = new ProgramController(service);
        const routes = new ProgramRoutes(controller);

        app.use('/programs', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'program-management' }, 'Program module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'program-management' }, 'Program module destroyed');
    },
};
