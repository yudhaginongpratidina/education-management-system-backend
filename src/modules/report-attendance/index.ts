// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { ReportAttendanceRepository } from './report-attendance.repository';
import { ReportAttendanceService } from './report-attendance.service';
import { ReportAttendanceController } from './report-attendance.controller';
import { ReportAttendanceRoutes } from './report-attendance.route';

export const reportAttendanceModule: Module = {
    name: 'report-attendance',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new ReportAttendanceRepository(database);
        const service = new ReportAttendanceService(repository);
        const controller = new ReportAttendanceController(service);
        const routes = new ReportAttendanceRoutes(controller);

        app.use('/report-attendance', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'report-attendance' },
            'Report attendance module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'report-attendance' },
            'Report attendance module destroyed',
        );
    },
};
