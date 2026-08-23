// core and interface
import { HttpError } from '../../core/errors/http.error';
import type { IProgramRepository, IProgramService } from './program.interface';

export class ProgramService implements IProgramService {
    constructor(
        private repo: IProgramRepository,
        private container: any,
    ) {}

    async create_program(data: {
        name: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const response = await this.repo.create_program(data);
        return response;
    }

    async get_program(
        filter: { id?: number; slug?: string; name?: string; status?: 'ACTIVE' | 'INACTIVE' },
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const result = await this.repo.get_program(filter, pagination);
        const isFiltering = filter && Object.keys(filter).length > 0;

        if (isFiltering && !pagination && result.length === 0) {
            throw new HttpError(404, 'Program not found', 'PROGRAM_NOT_FOUND', true);
        }

        return !pagination && isFiltering ? result[0] : result;
    }

    async update_program(data: {
        slug: string;
        name: string;
        description?: string;
        requirements?: string;
        price_per_session: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const existingProgram = await this.repo.get_program({ slug: data.slug });
        if (existingProgram.length === 0) {
            throw new HttpError(404, 'Program not found', 'PROGRAM_NOT_FOUND', true);
        }

        return await this.repo.update_program(data);
    }

    async delete_program(slug: string): Promise<any> {
        const existingProgram = await this.repo.get_program({ slug });
        if (existingProgram.length === 0) {
            throw new HttpError(404, 'Program not found', 'PROGRAM_NOT_FOUND', true);
        }

        return await this.repo.delete_program(slug);
    }
}
