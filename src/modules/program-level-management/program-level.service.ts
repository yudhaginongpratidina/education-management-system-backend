import { HttpError } from '../../core/errors/http.error';
import type { IProgramLevelRepository, IProgramLevelService } from './prorgam-level.interface';
import type { IProgramRepository } from '../program-management/program.interface';

export class ProgramLevelService implements IProgramLevelService {
    constructor(
        private repo: IProgramLevelRepository,
        private programRepo: IProgramRepository,
        private container: any,
    ) {}

    private async get_program_id_by_slug(program_slug: string): Promise<number> {
        const programs = await this.programRepo.get_program({ slug: program_slug });
        if (programs.length === 0) {
            throw new HttpError(404, 'Program not found', 'PROGRAM_NOT_FOUND', true);
        }
        return programs[0].id;
    }

    async create_level(data: {
        program_slug: string;
        level: number;
        name: string;
        description?: string;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const program_id = await this.get_program_id_by_slug(data.program_slug);

        const existing = await this.repo.get_levels({ program_id, level: data.level });
        if (existing.length > 0) {
            throw new HttpError(
                400,
                'Level already exists for this program',
                'LEVEL_ALREADY_EXISTS',
                true,
            );
        }

        return await this.repo.create_level({
            program_id,
            level: data.level,
            name: data.name,
            description: data.description,
            status: data.status ?? 'ACTIVE',
        });
    }

    async get_levels(
        program_slug: string,
        filter?: {
            level?: number;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const program_id = await this.get_program_id_by_slug(program_slug);

        return await this.repo.get_levels({ program_id, ...filter }, pagination);
    }

    async update_level(data: {
        program_slug: string;
        level: number;
        name: string;
        description?: string;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const program_id = await this.get_program_id_by_slug(data.program_slug);

        const existing = await this.repo.get_levels({ program_id, level: data.level });
        if (existing.length === 0) {
            throw new HttpError(404, 'Level not found', 'LEVEL_NOT_FOUND', true);
        }

        return await this.repo.update_level({
            id: existing[0].id,
            level: data.level,
            name: data.name,
            description: data.description,
            status: data.status ?? 'ACTIVE',
        });
    }

    async delete_level(data: { program_slug: string; level: number }): Promise<any> {
        const program_id = await this.get_program_id_by_slug(data.program_slug);

        const existing = await this.repo.get_levels({ program_id, level: data.level });
        if (existing.length === 0) {
            throw new HttpError(404, 'Level not found', 'LEVEL_NOT_FOUND', true);
        }

        return await this.repo.delete_level({ program_id, level: data.level });
    }
}
