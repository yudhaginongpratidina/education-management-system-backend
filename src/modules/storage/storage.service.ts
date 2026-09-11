import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
import AdmZip from 'adm-zip';
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

    async backup(): Promise<string> {
        const backupPath = path.join('uploads', `backup-${Date.now()}.zip`);
        const output = createWriteStream(backupPath);

        // Correct way to instantiate archiver in this version
        const archive = new archiver.Archiver('zip', { zlib: { level: 9 } });

        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);
            archive.pipe(output);
            archive.directory('uploads', false);
            archive.finalize();
        });

        // Clean up uploads folder except .gitignore
        const files = await fs.readdir('uploads');
        for (const file of files) {
            if (file !== '.gitignore' && file !== path.basename(backupPath)) {
                const filePath = path.join('uploads', file);
                const stats = await fs.lstat(filePath);
                if (stats.isDirectory()) {
                    await fs.rm(filePath, { recursive: true });
                } else {
                    await fs.unlink(filePath);
                }
            }
        }

        return backupPath;
    }

    async restore(zipFile: Express.Multer.File): Promise<void> {
        const zip = new AdmZip(zipFile.path);
        zip.extractAllTo('uploads', true);
        await fs.unlink(zipFile.path);
    }
}
