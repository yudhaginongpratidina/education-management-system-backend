// core and shared
import { HttpError } from '../../core/errors/http.error';
import { create_slug } from '../../shared/libs/slug';

// interface
import type { IProgramPackageRepository } from './program-package.interface';
import type { IProgramPackageService } from './program-package.interface';
import type { IProgramRepository } from '../program-management/program.interface';

export class ProgramPackageService implements IProgramPackageService {
    constructor(
        private repo: IProgramPackageRepository,
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

    async create_package(data: {
        program_slug: string;
        name: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months?: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const program_id = await this.get_program_id_by_slug(data.program_slug);
        const slug = create_slug(data.name);

        const existing = await this.repo.get_packages({ slug });
        if (existing.length > 0) {
            throw new HttpError(400, 'Package already exists', 'PACKAGE_ALREADY_EXISTS', true);
        }

        return await this.repo.create_package({
            program_id,
            name: data.name,
            slug,
            duration_months: data.duration_months,
            sessions_count: data.sessions_count,
            session_period: data.session_period,
            normal_price: data.normal_price,
            selling_price: data.selling_price,
            bonus_duration_months: data.bonus_duration_months ?? 0,
            status: data.status ?? 'ACTIVE',
        });
    }

    async get_packages(
        program_slug: string,
        filter?: {
            slug?: string;
            status?: 'ACTIVE' | 'INACTIVE';
        },
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const program_id = await this.get_program_id_by_slug(program_slug);

        return await this.repo.get_packages({ program_id, ...filter }, pagination);
    }

    async update_package(data: {
        slug: string;
        name: string;
        duration_months: number;
        sessions_count: number;
        session_period: 'WEEK' | 'MONTH' | 'DURATION';
        normal_price: number;
        selling_price: number;
        bonus_duration_months?: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const existing = await this.repo.get_packages({ slug: data.slug });
        if (existing.length === 0) {
            throw new HttpError(404, 'Package not found', 'PACKAGE_NOT_FOUND', true);
        }

        const newSlug = create_slug(data.name);
        if (newSlug !== data.slug) {
            const packageWithNewSlug = await this.repo.get_packages({ slug: newSlug });
            if (packageWithNewSlug.length > 0) {
                throw new HttpError(400, 'Package already exists', 'PACKAGE_ALREADY_EXISTS', true);
            }
        }

        return await this.repo.update_package({
            old_slug: data.slug,
            new_slug: newSlug,
            program_id: existing[0].program_id,
            name: data.name,
            duration_months: data.duration_months,
            sessions_count: data.sessions_count,
            session_period: data.session_period,
            normal_price: data.normal_price,
            selling_price: data.selling_price,
            bonus_duration_months: data.bonus_duration_months ?? 0,
            status: data.status ?? 'ACTIVE',
        });
    }

    async delete_package(slug: string): Promise<any> {
        const existing = await this.repo.get_packages({ slug });
        if (existing.length === 0) {
            throw new HttpError(404, 'Package not found', 'PACKAGE_NOT_FOUND', true);
        }

        return await this.repo.delete_package(slug);
    }
}
