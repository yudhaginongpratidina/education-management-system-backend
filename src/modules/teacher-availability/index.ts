// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { TeacherAvailabilityRepository } from './teacher-availablity.repository';
import { TeacherAvailabilityService } from './teacher-availablity.service';
import { TeacherAvailabilityController } from './teacher-availablity.controller';
import { TeacherAvailabilityRoutes } from './teacher-availablity.route';

export const teacherAvailabilityModule: Module = {
    name: 'teacher-availability',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new TeacherAvailabilityRepository(database);
        const service = new TeacherAvailabilityService(repository);
        const controller = new TeacherAvailabilityController(service);
        const routes = new TeacherAvailabilityRoutes(controller);

        app.use('/teacher-availability', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'teacher-availability' },
            'Teacher Availability module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'teacher-availability' },
            'Teacher Availability module destroyed',
        );
    },
};
