import type { IBranchRepository, IBranchService } from './branch.interface';
import { create_slug } from '../../shared/libs/slug';
import { HttpError } from '../../core/errors/http.error';
import { ErrorCodes } from '../../core/errors/error-codes';

export class BranchService implements IBranchService {
    constructor(
        private readonly repository: IBranchRepository,
        private readonly container: any,
    ) {}

    async create_branch(data: {
        name: string;
        address: string;
        latitude: string;
        longitude: string;
        radius: string;
    }): Promise<any> {
        const slug = create_slug(data.name);

        // Check for duplication
        const existing = await this.repository.get_branch({ slug });
        if (existing) {
            throw new HttpError(
                400,
                'Branch with this name already exists',
                ErrorCodes.CONFLICT,
                true,
            );
        }

        return await this.repository.create_branch({ ...data, slug });
    }

    async get_branches(): Promise<any> {
        return await this.repository.get_branch({});
    }

    async get_branch(filter: { id?: number; name?: string; slug?: string } = {}): Promise<any> {
        return await this.repository.get_branch(filter);
    }

    async update_branch(data: {
        id: number;
        name?: string;
        address?: string;
        latitude?: string;
        longitude?: string;
        radius?: string;
    }): Promise<any> {
        const updateData: any = { ...data };

        if (data.name) {
            const newSlug = create_slug(data.name);

            // Check if name actually changed and if new slug already exists (excluding current branch)
            const currentBranch = await this.repository.get_branch({ id: data.id });
            if (currentBranch && currentBranch.slug !== newSlug) {
                const existing = await this.repository.get_branch({ slug: newSlug });
                if (existing) {
                    throw new HttpError(
                        400,
                        'Branch with this name already exists',
                        ErrorCodes.CONFLICT,
                        true,
                    );
                }
                updateData.slug = newSlug;
            }
        }

        return await this.repository.update_branch(updateData);
    }

    async delete_branch(slug: string): Promise<any> {
        return await this.repository.delete_branch(slug);
    }
}
