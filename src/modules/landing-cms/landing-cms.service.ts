import { HttpError } from '../../core/errors/http.error';
import type { ILandingCmsRepository, ILandingCmsService } from './landing-cms.interface';

export class LandingCmsService implements ILandingCmsService {
    constructor(private readonly repository: ILandingCmsRepository) {}

    async getPublicContent(): Promise<Record<string, any>> {
        const rows = await this.repository.findAll(true);
        const content: Record<string, any> = {};
        for (const row of rows) {
            content[row.section_key] = row.content;
        }
        return content;
    }

    async getSections(): Promise<any[]> {
        return await this.repository.findAll(false);
    }

    async getSection(key: string): Promise<any> {
        const row = await this.repository.findByKey(key);
        if (!row) {
            throw new HttpError(404, 'Section not found', 'SECTION_NOT_FOUND', true);
        }
        return row;
    }

    async upsertSection(
        key: string,
        content: any,
        isActive: boolean,
        userId?: number | null,
    ): Promise<any> {
        if (content === undefined || content === null) {
            throw new HttpError(400, 'Content is required', 'CONTENT_REQUIRED', true);
        }
        return await this.repository.upsert(key, JSON.stringify(content), isActive, userId);
    }

    async bulkUpsert(
        sections: { key: string; content: any; is_active?: boolean }[],
        userId?: number | null,
    ): Promise<any[]> {
        for (const section of sections) {
            if (section.content === undefined || section.content === null) {
                throw new HttpError(
                    400,
                    `Content is required for section "${section.key}"`,
                    'CONTENT_REQUIRED',
                    true,
                );
            }
        }

        const results: any[] = [];
        for (const section of sections) {
            results.push(
                await this.repository.upsert(
                    section.key,
                    JSON.stringify(section.content),
                    section.is_active !== false,
                    userId,
                ),
            );
        }
        return results;
    }

    async deleteSection(key: string): Promise<void> {
        await this.getSection(key);
        await this.repository.delete(key);
    }

    async reset(): Promise<void> {
        await this.repository.deleteAll();
    }
}
