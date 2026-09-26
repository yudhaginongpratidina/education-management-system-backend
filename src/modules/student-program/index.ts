import type { Express } from 'express';
import type { Module } from '../../core/module';
import { StudentProgramRepository } from './student-program.repository';
import { StudentProgramService } from './student-program.service';
import { StudentProgramController } from './student-program.controller';
import { StudentProgramRoutes } from './student-program.route';

export const studentProgramModule: Module = {
    name: 'student-program-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new StudentProgramRepository(database);
        const service = new StudentProgramService(repository);
        const controller = new StudentProgramController(service);
        const routes = new StudentProgramRoutes(controller);

        app.use('/student-programs', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'student-program-management' },
            'Student program module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'student-program-management' },
            'Student program module destroyed',
        );
    },
};
