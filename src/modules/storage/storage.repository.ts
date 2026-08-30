import type { DatabaseClient } from '../../config/database/types';
import type { IStorage, IStorageRepository } from './storage.interface';

export class StorageRepository implements IStorageRepository {
    constructor(private readonly db: DatabaseClient) {}

    async upload(data: {
        original_name: string;
        slug: string;
        mime_type: string;
        extension: string | null;
    }): Promise<IStorage> {
        const query = `INSERT INTO storages (original_name, slug, mime_type, extension) VALUES (?, ?, ?, ?);`;
        const result = await this.db.query(query, [
            data.original_name,
            data.slug,
            data.mime_type,
            data.extension,
        ]);

        // Assuming the driver (likely mysql2) provides insertId on the result object
        const insertId = (result as any).insertId;

        return {
            id: insertId,
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

    async get(slug: string): Promise<IStorage | null> {
        const query = `SELECT * FROM storages WHERE slug = ?;`;
        const result = await this.db.query(query, [slug]);
        return result.rows[0] || null;
    }

    async delete(slug: string): Promise<void> {
        const query = `DELETE FROM storages WHERE slug = ?;`;
        await this.db.query(query, [slug]);
    }
}
