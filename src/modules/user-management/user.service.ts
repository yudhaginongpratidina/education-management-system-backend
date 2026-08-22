// core
import { HttpError } from '../../core/errors/http.error';

// interface
import type { IUserRepository, IUserService } from './user.interface';

// utils
import { create_slug } from '../../shared/libs/slug';
import { hashing_password } from '../../shared/libs/password';

export class UserService implements IUserService {
    constructor(
        private repo: IUserRepository,
        private container: any,
    ) {}

    async create_user(data: {
        full_name: string;
        slug: string;
        email: string;
        password_hash: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any> {
        const generated_slug = create_slug(data.full_name);
        data.slug = generated_slug;

        const existing_user = await this.repo.get_user({ email: data.email });
        if (existing_user.length > 0) {
            throw new HttpError(400, 'User already exists', 'USER_ALREADY_EXISTS', true);
        }

        data.password_hash = await hashing_password(data.password_hash);

        const response = await this.repo.create_user(data);
        return response;
    }

    async get_user(
        filter: { id?: number; slug?: string; email?: string; role?: string | null },
        pagination?: { limit: number; offset: number },
    ): Promise<any> {
        const result = await this.repo.get_user(filter, pagination);

        const isFiltering = filter && Object.keys(filter).length > 0;

        if (isFiltering && !pagination && result.length === 0) {
            throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        }

        return !pagination && isFiltering ? result[0] : result;
    }

    async update_user(data: {
        id: number;
        full_name: string;
        slug: string;
        email: string;
        role?: string | null;
        avatar?: string | null;
    }): Promise<any> {
        const existingUsers = await this.repo.get_user({ id: data.id });

        if (existingUsers.length === 0) {
            throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        }

        const user = existingUsers[0];
        const newSlug = create_slug(data.full_name);

        return await this.repo.update_user({
            id: user.id,
            full_name: data.full_name,
            slug: newSlug,
            email: data.email,
            role: data.role,
            avatar: data.avatar,
        });
    }

    async update_password(data: { id: number; password_hash: string }): Promise<any> {
        const password_hash = await hashing_password(data.password_hash);
        return await this.repo.update_password({ id: data.id, password_hash });
    }

    async delete_user(slug: string): Promise<any> {
        const existingUsers = await this.repo.get_user({ slug });

        if (existingUsers.length === 0) {
            throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        }

        return await this.repo.delete_user(slug);
    }
}
