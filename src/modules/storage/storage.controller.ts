import type { Request, Response, NextFunction } from 'express';
import type { IStorageController, IStorageService } from './storage.interface';

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
            const fileData = await this.service.get(slug);

            const filePath = require('path').join(__dirname, '../../../uploads', fileData.slug);
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
}
