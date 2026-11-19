import type { Request, Response, NextFunction } from 'express';
import type { IStorageController, IStorageService } from './storage.interface';
import path from 'path';
import fs from 'fs';

export class StorageController implements IStorageController {
    constructor(private readonly service: IStorageService) {}

    upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            const fileData = await this.service.upload(req.file);
            res.status(201).json({ success: true, message: 'File uploaded', data: fileData });
        } catch (error) {
            next(error);
        }
    };

    get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const slug = req.params.slug as string;
            // Check direct match in uploads
            const directPath = path.join(process.cwd(), 'uploads', slug);
            if (fs.existsSync(directPath) && !fs.statSync(directPath).isDirectory()) {
                res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
                res.setHeader('Access-Control-Allow-Origin', '*');
                return res.sendFile(directPath);
            }

            const fileData = await this.service.get(slug);
            const filePath = path.join(process.cwd(), 'uploads', fileData.slug);
            if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                res.status(404).json({ success: false, message: 'File not found on disk' });
                return;
            }
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.sendFile(filePath);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const slug = req.params.slug as string;
            await this.service.delete(slug);
            res.status(200).json({ success: true, message: 'File deleted' });
        } catch (error) {
            next(error);
        }
    };

    backup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const backupPath = await this.service.backup();
            res.download(backupPath, 'backup.zip');
        } catch (error) {
            next(error);
        }
    };

    restore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No zip file uploaded' });
                return;
            }
            await this.service.restore(req.file);
            res.status(200).json({ success: true, message: 'Backup restored' });
        } catch (error) {
            next(error);
        }
    };
}
