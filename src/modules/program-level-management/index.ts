// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { ProgramLevelRepository } from './program-level.repository';
import { ProgramRepository } from '../program-management/program.repository';
import { ProgramLevelService } from './program-level.service';
import { ProgramLevelController } from './program-level.controller';
import { ProgramLevelRoutes } from './program-level.route';

export const menuModule: Module = {
    name: 'menu',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const program_level_repository = new ProgramLevelRepository(database);
        const program_repository = new ProgramRepository(database);
        const service = new ProgramLevelService(
            program_level_repository,
            program_repository,
            container,
        );
        const controller = new ProgramLevelController(service);
        const routes = new ProgramLevelRoutes(controller);

        app.use('/program-levels', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'menu' }, 'Menu module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'menu' }, 'Menu module destroyed');
    },
};
