import type { DatabaseClient } from '../../config/database/types';
import type { ILandingCmsRepository } from './landing-cms.interface';

// mysql2 may hand back a JSON column already parsed (object) or as a raw
// string depending on the driver/column type. Normalise both.
const parseContent = (raw: any): any => {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
    return raw;
};

export class LandingCmsRepository implements ILandingCmsRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findAll(activeOnly = false): Promise<any[]> {
        const query = activeOnly
            ? `SELECT * FROM landing_sections WHERE is_active = TRUE ORDER BY section_key ASC;`
            : `SELECT * FROM landing_sections ORDER BY section_key ASC;`;
        const result = await this.db.query(query);
        return result.rows.map((row) => ({ ...row, content: parseContent(row.content) }));
    }

    async findByKey(key: string): Promise<any | null> {
        const result = await this.db.query(
            `SELECT * FROM landing_sections WHERE section_key = ? LIMIT 1;`,
            [key],
        );
        if (!result.rows[0]) return null;
        return { ...result.rows[0], content: parseContent(result.rows[0].content) };
    }

    async upsert(
        key: string,
        contentJson: string,
        isActive: boolean,
        updatedBy?: number | null,
    ): Promise<any> {
        await this.db.query(
            `INSERT INTO landing_sections (section_key, content, is_active, updated_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 content = VALUES(content),
                 is_active = VALUES(is_active),
                 updated_by = VALUES(updated_by);`,
            [key, contentJson, isActive ? 1 : 0, updatedBy ?? null],
        );
        return await this.findByKey(key);
    }

    async delete(key: string): Promise<void> {
        await this.db.query(`DELETE FROM landing_sections WHERE section_key = ?;`, [key]);
    }

    async deleteAll(): Promise<void> {
        await this.db.query(`DELETE FROM landing_sections;`);
    }
}
