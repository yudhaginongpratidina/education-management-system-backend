// dependencies
import type { Express } from 'express';
import type { Module } from '../../core/module';

// modules
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { BranchRoutes } from './branch.route';

export const branchModule: Module = {
    name: 'branch-management',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new BranchRepository(database);
        const service = new BranchService(repository, container);
        const controller = new BranchController(service);
        const routes = new BranchRoutes(controller);

        app.use('/branches', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'branch-management' }, 'Branch module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'branch-management' }, 'Branch module destroyed');
    },
};
