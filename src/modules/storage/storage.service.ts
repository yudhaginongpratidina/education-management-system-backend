import fs from 'fs/promises';
import path from 'path';
import { HttpError } from '../../core/errors/http.error';
import type { IStorage, IStorageRepository, IStorageService } from './storage.interface';
import { create_slug } from '../../shared/libs/slug';

export class StorageService implements IStorageService {
    constructor(private readonly repo: IStorageRepository) {}

    async upload(file: Express.Multer.File): Promise<IStorage> {
        const slug = `${Date.now()}-${create_slug(file.originalname)}`;

        // In a real scenario, you'd probably upload this to S3 or similar.
        // For now, assuming it's already saved locally by Multer or similar.

        return await this.repo.upload({
            original_name: file.originalname,
            slug: slug,
            mime_type: file.mimetype,
            extension: path.extname(file.originalname),
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

        // Delete from DB
        await this.repo.delete(slug);

        // Potentially delete actual file from storage here
    }
}
