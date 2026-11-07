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
        address?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        radius?: string | null;
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

        return await this.repository.create_branch({
            name: data.name,
            slug,
            address: data.address === '' || data.address === undefined ? null : data.address,
            latitude: data.latitude === '' || data.latitude === undefined ? null : data.latitude,
            longitude:
                data.longitude === '' || data.longitude === undefined ? null : data.longitude,
            radius: data.radius === '' || data.radius === undefined ? null : data.radius,
        });
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
        address?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        radius?: string | null;
    }): Promise<any> {
        const updateData: any = { id: data.id };

        if (data.name !== undefined) {
            updateData.name = data.name;
            const newSlug = create_slug(data.name);

            // Check if name actually changed and if new slug already exists (excluding current branch)
            const currentBranch = await this.repository.get_branch({ id: data.id });
            if (currentBranch && currentBranch.slug !== newSlug) {
                const existing = await this.repository.get_branch({ slug: newSlug });
                if (existing && existing.id !== data.id) {
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

        if (data.address !== undefined) {
            updateData.address = data.address === '' ? null : data.address;
        }
        if (data.latitude !== undefined) {
            updateData.latitude = data.latitude === '' ? null : data.latitude;
        }
        if (data.longitude !== undefined) {
            updateData.longitude = data.longitude === '' ? null : data.longitude;
        }
        if (data.radius !== undefined) {
            updateData.radius = data.radius === '' ? null : data.radius;
        }

        return await this.repository.update_branch(updateData);
    }

    async delete_branch(slug: string): Promise<any> {
        return await this.repository.delete_branch(slug);
    }
}
