import type { Express } from 'express';
import type { Module } from '../../core/module';

import { ClassSessionStudentRepository } from '../class-session/class-session-student.repository';

import { TeacherSessionRepository } from './teacher-session.repository';
import { TeacherSessionService } from './teacher-session.service';
import { TeacherSessionController } from './teacher-session.controller';
import { TeacherSessionRoutes } from './teacher-session.route';

export const teacherSessionModule: Module = {
    name: 'teacher-session',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const teacherSessionRepository = new TeacherSessionRepository(database);
        const classSessionStudentRepository = new ClassSessionStudentRepository(database);

        const service = new TeacherSessionService(
            teacherSessionRepository,
            classSessionStudentRepository,
            database,
        );
        const controller = new TeacherSessionController(service);
        const routes = new TeacherSessionRoutes(controller);

        app.use('/teacher', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'teacher-session' }, 'Teacher session module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'teacher-session' }, 'Teacher session module destroyed');
    },
};
