import type { DatabaseClient } from '../../config/database/types';
import type { AppThemeConfig, AppThemeEntity, IThemeRepository } from './theme.interface';

const parseConfig = (raw: any): AppThemeConfig | null => {
    if (!raw) return null;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
    return raw;
};

export class ThemeRepository implements IThemeRepository {
    constructor(private readonly db: DatabaseClient) {}

    async getTheme(id = 'default'): Promise<AppThemeEntity | null> {
        const result = await this.db.query(
            `SELECT id, theme_name, config, updated_by, created_at, updated_at
             FROM app_themes
             WHERE id = ?
             LIMIT 1;`,
            [id],
        );

        if (!result.rows[0]) return null;

        const row = result.rows[0];
        return {
            id: row.id,
            theme_name: row.theme_name,
            config: parseConfig(row.config) as AppThemeConfig,
            updated_by: row.updated_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async saveTheme(
        id = 'default',
        themeName: string,
        config: AppThemeConfig,
        updatedBy?: number | null,
    ): Promise<AppThemeEntity> {
        const configJson = JSON.stringify(config);
        await this.db.query(
            `INSERT INTO app_themes (id, theme_name, config, updated_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 theme_name = VALUES(theme_name),
                 config = VALUES(config),
                 updated_by = VALUES(updated_by);`,
            [id, themeName, configJson, updatedBy ?? null],
        );

        const saved = await this.getTheme(id);
        if (!saved) {
            throw new Error('Failed to retrieve saved theme');
        }
        return saved;
    }

    async resetTheme(id = 'default'): Promise<void> {
        await this.db.query(`DELETE FROM app_themes WHERE id = ?;`, [id]);
    }
}
