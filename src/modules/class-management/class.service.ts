import { HttpError } from '../../core/errors/http.error';
import type { Pagination } from '../../shared/class/class.types';
import type { ClassListFilter, IClassRepository, IClassService } from './class.interface';
import { isDuplicateEntryError, isForeignKeyConstraintError } from '../../shared/class/class.util';

export class ClassService implements IClassService {
    constructor(private readonly repository: IClassRepository) {}

    async createClass(data: {
        branch_id: number;
        name: string;
        code: string;
        description?: string | null;
        status?: 'ACTIVE' | 'INACTIVE';
    }): Promise<any> {
        const branchExists = await this.repository.branchExists(data.branch_id);
        if (!branchExists) {
            throw new HttpError(400, 'Branch not found', 'BRANCH_NOT_FOUND', true);
        }

        const existing = await this.repository.findByCode(data.code);
        if (existing) {
            throw new HttpError(
                409,
                'Class code already exists',
                'CLASS_CODE_ALREADY_EXISTS',
                true,
            );
        }

        try {
            return await this.repository.create(data);
        } catch (error) {
            if (isDuplicateEntryError(error)) {
                throw new HttpError(
                    409,
                    'Class code already exists',
                    'CLASS_CODE_ALREADY_EXISTS',
                    true,
                );
            }
            throw error;
        }
    }

    async getClasses(filter: ClassListFilter, pagination?: Pagination): Promise<any> {
        return await this.repository.findAll(filter, pagination);
    }

    async getClassById(id: number): Promise<any> {
        const found = await this.repository.findById(id);
        if (!found) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }
        return found;
    }

    async updateClass(id: number, data: any): Promise<any> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }

        if (data.branch_id !== undefined && data.branch_id !== existing.branch_id) {
            const branchExists = await this.repository.branchExists(data.branch_id);
            if (!branchExists) {
                throw new HttpError(400, 'Branch not found', 'BRANCH_NOT_FOUND', true);
            }
        }

        if (data.code !== undefined && data.code !== existing.code) {
            const duplicate = await this.repository.findByCode(data.code, id);
            if (duplicate) {
                throw new HttpError(
                    409,
                    'Class code already exists',
                    'CLASS_CODE_ALREADY_EXISTS',
                    true,
                );
            }
        }

        try {
            return await this.repository.update(id, data);
        } catch (error) {
            if (isDuplicateEntryError(error)) {
                throw new HttpError(
                    409,
                    'Class code already exists',
                    'CLASS_CODE_ALREADY_EXISTS',
                    true,
                );
            }
            throw error;
        }
    }

    async deleteClass(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }

        try {
            await this.repository.delete(id);
        } catch (error) {
            if (isForeignKeyConstraintError(error)) {
                throw new HttpError(
                    409,
                    'Class cannot be deleted because it still has related sessions',
                    'CLASS_HAS_DEPENDENCIES',
                    true,
                );
            }
            throw error;
        }
    }
}
