import type { Express } from 'express';
import type { Module } from '../../core/module';

import { ClassRepository } from './class.repository';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { ClassRoutes } from './class.route';

export const classManagementModule: Module = {
    name: 'class-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        // repositories
        const classRepository = new ClassRepository(database);

        // services
        const classService = new ClassService(classRepository);

        // controllers
        const classController = new ClassController(classService);

        // routes
        app.use('/classes', new ClassRoutes(classController).router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'class-management' },
            'Class management module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info({ module: 'class-management' }, 'Class management module destroyed');
    },
};
