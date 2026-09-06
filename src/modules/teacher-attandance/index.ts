// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { TeacherAttendanceRepository } from './teacher_attandance.repository';
import { TeacherAttendanceService } from './teacher_attandance.service';
import { TeacherAttendanceController } from './teacher_attandance.controller';
import { TeacherAttendanceRoutes } from './teacher_attandance.route';
import { TeacherRepository } from '../teacher/teacher.repository';

export const teacherAttendanceModule: Module = {
    name: 'teacher-attandance',
    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new TeacherAttendanceRepository(database);
        const teacher_repository = new TeacherRepository(database);
        const service = new TeacherAttendanceService(repository, teacher_repository, container);
        const controller = new TeacherAttendanceController(service);
        const routes = new TeacherAttendanceRoutes(controller);

        app.use('/teacher-attendances', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'teacher-attandance' },
            'Teacher attendance module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'teacher-attandance' },
            'Teacher attendance module destroyed',
        );
    },
};
