// core
import { HttpError } from '../../core/errors/http.error';

// interface
import type { IRoleRepository } from './role.interface';
import type { IRoleService } from './role.interface';

// utils
import { create_slug } from '../../shared/libs/slug';

export class RoleService implements IRoleService {
    constructor(
        private repo: IRoleRepository,
        private container: any,
    ) {}

    async create_role(data: { name: string; slug: string; description: string }): Promise<any> {
        const generate_slug = create_slug(data.name);
        data.slug = generate_slug;

        const existing_role = await this.repo.get_role({ slug: data.slug });
        if (existing_role.length > 0) {
            throw new HttpError(400, 'Role already exists', 'ROLE_ALREADY_EXISTS', true);
        }

        const response = await this.repo.create_role(data);
        return response;
    }

    async update_role(data: { name: string; slug: string; description: string }): Promise<any> {
        const existingRole = await this.repo.get_role({
            slug: data.slug,
        });

        if (!existingRole.length) {
            throw new HttpError(404, 'Role not found', 'ROLE_NOT_FOUND', true);
        }

        const role = existingRole[0];
        const newSlug = create_slug(data.name);

        if (newSlug !== data.slug) {
            const roleWithNewSlug = await this.repo.get_role({
                slug: newSlug,
            });

            if (roleWithNewSlug.length > 0) {
                throw new HttpError(400, 'Role already exists', 'ROLE_ALREADY_EXISTS', true);
            }
        }

        return this.repo.update_role({
            id: role.id,
            name: data.name,
            slug: newSlug,
            description: data.description,
        });
    }

    async delete_role(slug: string): Promise<any> {
        const existingRole = await this.repo.get_role({
            slug,
        });

        if (!existingRole.length) {
            throw new HttpError(404, 'Role not found', 'ROLE_NOT_FOUND', true);
        }

        return this.repo.delete_role(slug);
    }

    async get_role(
        filter: { id?: number; name?: string; slug?: string },
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const result = await this.repo.get_role(filter, pagination);

        const isFiltering = filter && Object.keys(filter).length > 0;

        if (isFiltering && !pagination && result.length === 0) {
            throw new HttpError(404, 'Role not found', 'ROLE_NOT_FOUND', true);
        }

        return !pagination && isFiltering ? result[0] : result;
    }
}
