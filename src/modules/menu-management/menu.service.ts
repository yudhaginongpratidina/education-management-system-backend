// core and shared
import { HttpError } from '../../core/errors/http.error';
import { create_slug } from '../../shared/libs/slug';

// interface
import type { IMenuRepository, IMenuService } from './menu.interface';

export class MenuService implements IMenuService {
    constructor(
        private repo: IMenuRepository,
        private container: any,
    ) {}

    async create_menu(data: any): Promise<any> {
        const slug = create_slug(data.name);
        const existing = await this.repo.get_menu({ slug });
        if (existing.length > 0)
            throw new HttpError(400, 'Menu already exists', 'MENU_ALREADY_EXISTS', true);

        return await this.repo.create_menu({ ...data, slug });
    }

    async get_menu(filter: any, pagination?: any): Promise<any> {
        const result = await this.repo.get_menu(filter, pagination);
        const isFiltering = filter && Object.keys(filter).length > 0;
        if (isFiltering && !pagination && result.length === 0)
            throw new HttpError(404, 'Menu not found', 'MENU_NOT_FOUND', true);
        return !pagination && isFiltering ? result[0] : result;
    }

    async update_menu(data: any): Promise<any> {
        const existing = await this.repo.get_menu({ slug: data.slug });
        if (existing.length === 0)
            throw new HttpError(404, 'Menu not found', 'MENU_NOT_FOUND', true);

        const existingMenu = existing[0];
        const newSlug = create_slug(data.name);

        if (newSlug !== existingMenu.slug) {
            const menuWithNewSlug = await this.repo.get_menu({ slug: newSlug });
            if (menuWithNewSlug.length > 0)
                throw new HttpError(400, 'Menu already exists', 'MENU_ALREADY_EXISTS', true);
        }

        return await this.repo.update_menu({ ...data, slug: newSlug, id: existingMenu.id });
    }

    async delete_menu(slug: string): Promise<any> {
        const existing = await this.repo.get_menu({ slug });
        if (existing.length === 0)
            throw new HttpError(404, 'Menu not found', 'MENU_NOT_FOUND', true);
        return await this.repo.delete_menu(slug);
    }
}
