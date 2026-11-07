import type { Express } from 'express';
import type { Container } from '../../core/container';
import type { Module } from '../../core/module';
import { ManualAttendanceRepository } from './manual-attendance.repository';
import { ManualAttendanceService } from './manual-attendance.service';
import { ManualAttendanceController } from './manual-attendance.controller';
import { ManualAttendanceRoutes } from './manual-attendance.route';
import { TeacherRepository } from '../teacher/teacher.repository';
import { BranchRepository } from '../branch-management/branch.repository';

export const manualAttendanceModule: Module = {
    name: 'manual-attendance',
    register: (app: Express, container: Container) => {
        const db = container.db.getPrimary();

        const repository = new ManualAttendanceRepository(db);
        const teacherRepo = new TeacherRepository(db);
        const branchRepo = new BranchRepository(db);

        const service = new ManualAttendanceService(repository, teacherRepo, branchRepo);
        const controller = new ManualAttendanceController(service);
        const routes = new ManualAttendanceRoutes(controller);

        app.use('/manual-attendance', routes.router());
    },
};
