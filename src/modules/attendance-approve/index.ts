import type { Express } from 'express';
import type { Module } from '../../core/module';
import { AttendanceApproveRepository } from './attendance-approve.repository';
import { AttendanceApproveService } from './attendance-approve.service';
import { AttendanceApproveController } from './attendance-approve.controller';
import { AttendanceApproveRoutes } from './attendance-approve.route';

export const attendanceApproveModule: Module = {
    name: 'attendance-approve',
    register: (app: Express, container) => {
        const database = container.db.get('main');
        const repository = new AttendanceApproveRepository(database);
        const service = new AttendanceApproveService(repository);
        const controller = new AttendanceApproveController(service);
        const routes = new AttendanceApproveRoutes(controller);

        app.use('/attendance-approvals', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'attendance-approve' },
            'Attendance approve module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'attendance-approve' },
            'Attendance approve module destroyed',
        );
    },
};
