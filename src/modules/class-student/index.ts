import type { Express } from 'express';
import type { Module } from '../../core/module';

import { ClassRepository } from '../class-management/class.repository';
import { ClassStudentRepository } from './class-student.repository';
import { ClassStudentService } from './class-student.service';
import { ClassStudentController } from './class-student.controller';
import { ClassStudentRoutes } from './class-student.route';

export const classStudentModule: Module = {
    name: 'class-student',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        // repositories
        const classRepository = new ClassRepository(database);
        const classStudentRepository = new ClassStudentRepository(database);

        // services
        const classStudentService = new ClassStudentService(
            classStudentRepository,
            classRepository,
        );

        // controllers
        const classStudentController = new ClassStudentController(classStudentService);

        // routes
        app.use('/classes', new ClassStudentRoutes(classStudentController).router());
    },

    async onInit(container) {
        container.logger.info({ module: 'class-student' }, 'Class student module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'class-student' }, 'Class student module destroyed');
    },
};
