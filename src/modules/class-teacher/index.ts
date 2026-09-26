import type { Express } from 'express';
import type { Module } from '../../core/module';

import { ClassRepository } from '../class-management/class.repository';
import { ClassTeacherRepository } from './class-teacher.repository';
import { ClassTeacherService } from './class-teacher.service';
import { ClassTeacherController } from './class-teacher.controller';
import { ClassTeacherRoutes } from './class-teacher.route';

export const classTeacherModule: Module = {
    name: 'class-teacher',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        // repositories
        const classRepository = new ClassRepository(database);
        const classTeacherRepository = new ClassTeacherRepository(database);

        // services
        const classTeacherService = new ClassTeacherService(
            classTeacherRepository,
            classRepository,
        );

        // controllers
        const classTeacherController = new ClassTeacherController(classTeacherService);

        // routes
        app.use('/classes', new ClassTeacherRoutes(classTeacherController).router());
    },

    async onInit(container) {
        container.logger.info({ module: 'class-teacher' }, 'Class teacher module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'class-teacher' }, 'Class teacher module destroyed');
    },
};
