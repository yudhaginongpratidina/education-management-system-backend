import fs from 'fs/promises';
import path from 'path';
import { HttpError } from '../../core/errors/http.error';
import type { IStorage, IStorageRepository, IStorageService } from './storage.interface';
import { create_slug } from '../../shared/libs/slug';

export class StorageService implements IStorageService {
    constructor(private readonly repo: IStorageRepository) {}

    async upload(file: Express.Multer.File): Promise<IStorage> {
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const slug = `${Date.now()}-${create_slug(nameWithoutExt)}${ext}`;

        const newPath = path.join('uploads', slug);
        await fs.rename(file.path, newPath);

        return await this.repo.upload({
            original_name: file.originalname,
            slug: slug,
            mime_type: file.mimetype,
            extension: ext,
        });
    }

    async get(slug: string): Promise<IStorage> {
        const storage = await this.repo.get(slug);
        if (!storage) throw new HttpError(404, 'File not found', 'FILE_NOT_FOUND', true);
        return storage;
    }

    async delete(slug: string): Promise<void> {
        const storage = await this.repo.get(slug);
        if (!storage) throw new HttpError(404, 'File not found', 'FILE_NOT_FOUND', true);

        // Delete actual file
        const filePath = path.join('uploads', storage.slug);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            // Log error but continue to delete from DB if file is already missing
            console.error(`Failed to delete file: ${filePath}`, error);
        }

        // Delete from DB
        await this.repo.delete(slug);
    }
}
