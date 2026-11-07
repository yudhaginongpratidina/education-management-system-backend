import type { Express } from 'express';
import type { Module } from '../../core/module';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { BackupRoutes } from './backup.route';

export const backupModule: Module = {
    name: 'backup',

    register: (app: Express, container) => {
        const database = container.db.get('main');
        const service = new BackupService(database);
        const controller = new BackupController(service);
        const routes = new BackupRoutes(controller);

        app.use('/backup', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'backup' }, 'Backup module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'backup' }, 'Backup module destroyed');
    },
};
