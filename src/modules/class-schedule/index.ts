import type { Express } from 'express';
import type { Module } from '../../core/module';

import { ScheduleConflictService } from '../../shared/class/schedule-conflict.service';
import { ClassRepository } from '../class-management/class.repository';
import { ClassScheduleRepository } from './class-schedule.repository';
import { ClassScheduleService } from './class-schedule.service';
import { ClassScheduleController } from './class-schedule.controller';
import { ClassScheduleRoutes } from './class-schedule.route';

export const classScheduleModule: Module = {
    name: 'class-schedule',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        // repositories
        const classRepository = new ClassRepository(database);
        const classScheduleRepository = new ClassScheduleRepository(database);

        // shared conflict detection
        const scheduleConflictService = new ScheduleConflictService(classScheduleRepository);

        // services
        const classScheduleService = new ClassScheduleService(
            classScheduleRepository,
            classRepository,
            scheduleConflictService,
        );

        // controllers
        const classScheduleController = new ClassScheduleController(classScheduleService);

        // routes
        app.use('/classes', new ClassScheduleRoutes(classScheduleController).router());
    },

    async onInit(container) {
        container.logger.info({ module: 'class-schedule' }, 'Class schedule module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'class-schedule' }, 'Class schedule module destroyed');
    },
};
