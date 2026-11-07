import type { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import { HttpError } from '../../core/errors/http.error';
import type { IBackupService } from './backup.interface';

export class BackupController {
    constructor(private readonly service: IBackupService) {}

    getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const status = await this.service.getStatus();
            res.json({ success: true, data: status });
        } catch (error) {
            next(error);
        }
    };

    exportDatabase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filePath = await this.service.exportDatabase();
            const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            const filename = `ems-database-backup-${dateStr}.sql`;

            res.download(filePath, filename, async (err) => {
                try {
                    await fs.unlink(filePath);
                } catch {}
                if (err && !res.headersSent) {
                    next(err);
                }
            });
        } catch (error) {
            next(error);
        }
    };

    importDatabase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw new HttpError(400, 'Berkas SQL wajib diunggah', 'FILE_REQUIRED', true);
            }
            const result = await this.service.importDatabase(req.file.path);
            res.json({ success: true, message: result.message });
        } catch (error) {
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch {}
            }
            next(error);
        }
    };

    exportUploads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filePath = await this.service.exportUploads();
            const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            const filename = `ems-uploads-backup-${dateStr}.zip`;

            res.download(filePath, filename, async (err) => {
                try {
                    await fs.unlink(filePath);
                } catch {}
                if (err && !res.headersSent) {
                    next(err);
                }
            });
        } catch (error) {
            next(error);
        }
    };

    importUploads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                throw new HttpError(400, 'Berkas ZIP wajib diunggah', 'FILE_REQUIRED', true);
            }
            const result = await this.service.importUploads(req.file.path);
            res.json({ success: true, message: result.message, count: result.count });
        } catch (error) {
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch {}
            }
            next(error);
        }
    };
}
