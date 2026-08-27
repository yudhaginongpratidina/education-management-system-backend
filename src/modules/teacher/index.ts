// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { TeacherRepository } from './teacher.repository';
import { UserRepository } from '../user-management/user.repository';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TeacherRoutes } from './teacher.route';

export const teacherModule: Module = {
    name: 'teacher-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const teacher_repository = new TeacherRepository(database);
        const user_repository = new UserRepository(database);

        const service = new TeacherService(teacher_repository, user_repository, container);
        const controller = new TeacherController(service);
        const routes = new TeacherRoutes(controller);

        app.use('/teachers', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'teacher-management' }, 'Teacher module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'teacher-management' }, 'Teacher module destroyed');
    },
};
