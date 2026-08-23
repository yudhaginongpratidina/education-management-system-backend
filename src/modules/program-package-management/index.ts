// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { ProgramPackageRepository } from './program-package.repository';
import { ProgramRepository } from '../program-management/program.repository';
import { ProgramPackageService } from './program-package.service';
import { ProgramPackageController } from './program-package.controller';
import { ProgramPackageRoutes } from './program-package.route';

export const programPackageModule: Module = {
    name: 'program-package',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const program_package_repository = new ProgramPackageRepository(database);
        const program_repository = new ProgramRepository(database);
        const service = new ProgramPackageService(
            program_package_repository,
            program_repository,
            container,
        );
        const controller = new ProgramPackageController(service);
        const routes = new ProgramPackageRoutes(controller);

        app.use('/program-packages', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'program-package' }, 'Program package module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'program-package' }, 'Program package module destroyed');
    },
};
