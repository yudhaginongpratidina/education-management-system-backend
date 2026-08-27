// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { TeacherProgramRepository } from './teacher-program.repository';
import { TeacherProgramService } from './teacher-program.service';
import { TeacherProgramController } from './teacher-program.controller';
import { TeacherProgramRoutes } from './teacher-program.route';

export const teacherProgramModule: Module = {
    name: 'teacher-program-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new TeacherProgramRepository(database);
        const service = new TeacherProgramService(repository, container);
        const controller = new TeacherProgramController(service);
        const routes = new TeacherProgramRoutes(controller);

        app.use('/teacher-programs', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'teacher-program-management' },
            'Teacher program module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'teacher-program-management' },
            'Teacher program module destroyed',
        );
    },
};
