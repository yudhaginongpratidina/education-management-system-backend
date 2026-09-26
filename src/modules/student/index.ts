import type { Express } from 'express';
import type { Module } from '../../core/module';
import { StudentRepository } from './student.repository';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { StudentRoutes } from './student.route';

export const studentModule: Module = {
    name: 'student-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const student_repository = new StudentRepository(database);
        const service = new StudentService(student_repository);
        const controller = new StudentController(service);
        const routes = new StudentRoutes(controller);

        app.use('/students', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'student-management' }, 'Student module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'student-management' }, 'Student module destroyed');
    },
};
