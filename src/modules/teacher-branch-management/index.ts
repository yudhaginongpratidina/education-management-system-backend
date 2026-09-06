// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { TeacherBranchRepository } from './teacher-branch.repository';
import { TeacherBranchService } from './teacher-branch.service';
import { TeacherBranchController } from './teacher-branch.controller';
import { TeacherBranchRoutes } from './teacher-branch.route';

export const teacherBranchModule: Module = {
    name: 'teacher-branch-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new TeacherBranchRepository(database);
        const service = new TeacherBranchService(repository, container);
        const controller = new TeacherBranchController(service);
        const routes = new TeacherBranchRoutes(controller);

        app.use('/teacher-branches', routes.router());
    },

    async onInit(container) {
        container.logger.info(
            { module: 'teacher-branch-management' },
            'Teacher branch module initialized',
        );
    },

    async onDestroy(container) {
        container.logger.info(
            { module: 'teacher-branch-management' },
            'Teacher branch module destroyed',
        );
    },
};
