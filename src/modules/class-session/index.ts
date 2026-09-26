import type { Express } from 'express';
import type { Module } from '../../core/module';

import { SessionConflictService } from '../../shared/class/schedule-conflict.service';
import { ClassRepository } from '../class-management/class.repository';
import { ClassTeacherRepository } from '../class-teacher/class-teacher.repository';
import { ClassScheduleRepository } from '../class-schedule/class-schedule.repository';

import { ClassSessionRepository } from './class-session.repository';
import { ClassSessionService } from './class-session.service';
import { ClassSessionStudentRepository } from './class-session-student.repository';
import { ClassSessionStudentService } from './class-session-student.service';
import { SessionGenerationService } from './session-generation.service';
import { SessionController } from './session.controller';
import { SessionRoutes } from './session.route';

export const classSessionModule: Module = {
    name: 'class-session',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        // repositories
        const classRepository = new ClassRepository(database);
        const classTeacherRepository = new ClassTeacherRepository(database);
        const classScheduleRepository = new ClassScheduleRepository(database);
        const classSessionRepository = new ClassSessionRepository(database);
        const classSessionStudentRepository = new ClassSessionStudentRepository(database);

        // shared conflict detection
        const conflictService = new SessionConflictService(
            classSessionRepository,
            classSessionStudentRepository,
        );

        // services
        const classSessionService = new ClassSessionService(
            classSessionRepository,
            classRepository,
            classTeacherRepository,
            classSessionStudentRepository,
            conflictService,
            database,
        );
        const classSessionStudentService = new ClassSessionStudentService(
            classSessionStudentRepository,
            classSessionRepository,
            conflictService,
            database,
        );
        const sessionGenerationService = new SessionGenerationService(
            classRepository,
            classScheduleRepository,
            classSessionRepository,
            classTeacherRepository,
            conflictService,
            database,
        );

        // controllers
        const sessionController = new SessionController(
            classSessionService,
            classSessionStudentService,
            sessionGenerationService,
        );

        // routes
        const sessionRoutes = new SessionRoutes(sessionController);
        app.use('/classes', sessionRoutes.classRouter());
        app.use('/sessions', sessionRoutes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'class-session' }, 'Class session module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'class-session' }, 'Class session module destroyed');
    },
};
