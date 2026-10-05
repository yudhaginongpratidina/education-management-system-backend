import { HttpError } from '../../core/errors/http.error';
import { create_slug } from '../../shared/libs/slug';
import type {
    AssetCategoryInput,
    AssetFilter,
    AssetInput,
    AssetMovementInput,
    IAssetRepository,
    IAssetService,
} from './asset.interface';

const num = (value: unknown): number => Number(value ?? 0);
const round1 = (value: number): number => Math.round(value * 10) / 10;

export class AssetService implements IAssetService {
    constructor(private readonly repository: IAssetRepository) {}

    // ============================================================
    // HELPERS
    // ============================================================
    private enrich(row: any): any {
        const ageMonths = row.age_months != null ? Number(row.age_months) : null;
        const remainingMonths = row.remaining_months != null ? Number(row.remaining_months) : null;
        const usefulMonths =
            row.useful_life_years != null ? Number(row.useful_life_years) * 12 : null;

        return {
            ...row,
            purchase_price: num(row.purchase_price),
            age_months: ageMonths,
            age_years: ageMonths != null ? round1(ageMonths / 12) : null,
            remaining_months: remainingMonths,
            remaining_years: remainingMonths != null ? round1(remainingMonths / 12) : null,
            life_percent:
                usefulMonths && ageMonths != null
                    ? Math.min(Math.round((ageMonths / usefulMonths) * 100), 100)
                    : null,
            is_expired: remainingMonths != null ? remainingMonths <= 0 : null,
        };
    }

    private normalizeSummary(raw: any): any {
        return {
            total: num(raw.total),
            total_value: num(raw.total_value),
            by_status: {
                ACTIVE: num(raw.active),
                IN_USE: num(raw.in_use),
                MAINTENANCE: num(raw.maintenance),
                RETIRED: num(raw.retired),
                LOST: num(raw.lost),
                DISPOSED: num(raw.disposed),
            },
            by_condition: {
                GOOD: num(raw.good),
                FAIR: num(raw.fair),
                DAMAGED: num(raw.damaged),
                BROKEN: num(raw.broken),
            },
            expired: num(raw.expired),
            near_end: num(raw.near_end),
        };
    }

    private parsePagination(filter: AssetFilter): { limit: number; offset: number } {
        const limit = Math.min(Math.max(Number(filter.limit) || 50, 1), 500);
        const page = Math.max(Number(filter.page) || 1, 1);
        return { limit, offset: (page - 1) * limit };
    }

    // ============================================================
    // CATEGORIES
    // ============================================================
    async createCategory(data: AssetCategoryInput): Promise<any> {
        const name = data.name?.trim();
        if (!name) {
            throw new HttpError(400, 'Nama kategori wajib diisi', 'NAME_REQUIRED', true);
        }
        const existing = await this.repository.findCategoryByName(name);
        if (existing) {
            throw new HttpError(409, 'Kategori sudah ada', 'CATEGORY_EXISTS', true);
        }
        return await this.repository.createCategory({
            ...data,
            name,
            slug: create_slug(name),
            code_prefix: data.code_prefix ? data.code_prefix.trim().toUpperCase() : null,
        });
    }

    async getCategories(filter: { search?: string }): Promise<any[]> {
        return await this.repository.findCategories(filter);
    }

    async getCategory(id: number): Promise<any> {
        const category = await this.repository.findCategoryById(id);
        if (!category) {
            throw new HttpError(404, 'Kategori tidak ditemukan', 'CATEGORY_NOT_FOUND', true);
        }
        return category;
    }

    async updateCategory(id: number, data: Partial<AssetCategoryInput>): Promise<any> {
        await this.getCategory(id);
        const update: Partial<AssetCategoryInput> = { ...data };
        if (data.name) {
            update.name = data.name.trim();
            update.slug = create_slug(update.name);
        }
        if (data.code_prefix !== undefined) {
            update.code_prefix = data.code_prefix ? data.code_prefix.trim().toUpperCase() : null;
        }
        return await this.repository.updateCategory(id, update);
    }

    async deleteCategory(id: number): Promise<void> {
        await this.getCategory(id);
        const count = await this.repository.countAssetsInCategory(id);
        if (count > 0) {
            throw new HttpError(
                409,
                'Kategori masih dipakai oleh aset, pindahkan aset terlebih dahulu',
                'CATEGORY_IN_USE',
                true,
            );
        }
        await this.repository.deleteCategory(id);
    }

    // ============================================================
    // ASSETS
    // ============================================================
    async createAsset(data: AssetInput): Promise<any> {
        const name = data.name?.trim();
        if (!name) {
            throw new HttpError(400, 'Nama aset wajib diisi', 'NAME_REQUIRED', true);
        }
        const category = await this.repository.findCategoryById(data.category_id);
        if (!category) {
            throw new HttpError(404, 'Kategori tidak ditemukan', 'CATEGORY_NOT_FOUND', true);
        }

        const created = await this.repository.createAsset({ ...data, name });
        const prefix = (category.code_prefix || 'AST').trim().toUpperCase();
        const code = `${prefix}-${String(created.id).padStart(5, '0')}`;
        await this.repository.updateAssetCode(created.id, code);

        const full = await this.repository.findAssetById(created.id);
        return this.enrich(full);
    }

    async getAssets(filter: AssetFilter): Promise<any> {
        const pagination = this.parsePagination(filter);
        const [rows, summary] = await Promise.all([
            this.repository.findAssets(filter, pagination),
            this.repository.assetSummary(filter),
        ]);
        return {
            data: rows.map((row) => this.enrich(row)),
            pagination: {
                limit: pagination.limit,
                offset: pagination.offset,
                page: filter.page ?? 1,
            },
            summary: this.normalizeSummary(summary),
        };
    }

    async getAsset(id: number): Promise<any> {
        const asset = await this.repository.findAssetById(id);
        if (!asset) {
            throw new HttpError(404, 'Aset tidak ditemukan', 'ASSET_NOT_FOUND', true);
        }
        const movements = await this.repository.findMovementsByAsset(id);
        return { ...this.enrich(asset), movements };
    }

    async updateAsset(id: number, data: Partial<AssetInput>): Promise<any> {
        const asset = await this.repository.findAssetById(id);
        if (!asset) {
            throw new HttpError(404, 'Aset tidak ditemukan', 'ASSET_NOT_FOUND', true);
        }
        if (data.name !== undefined && !data.name.trim()) {
            throw new HttpError(400, 'Nama aset wajib diisi', 'NAME_REQUIRED', true);
        }
        if (data.category_id !== undefined) {
            const category = await this.repository.findCategoryById(data.category_id);
            if (!category) {
                throw new HttpError(404, 'Kategori tidak ditemukan', 'CATEGORY_NOT_FOUND', true);
            }
        }
        const updated = await this.repository.updateAsset(id, data);
        return this.enrich(updated);
    }

    async deleteAsset(id: number): Promise<void> {
        const asset = await this.repository.findAssetById(id);
        if (!asset) {
            throw new HttpError(404, 'Aset tidak ditemukan', 'ASSET_NOT_FOUND', true);
        }
        await this.repository.deleteAsset(id);
    }

    async getAssetSummary(filter: AssetFilter): Promise<any> {
        return this.normalizeSummary(await this.repository.assetSummary(filter));
    }

    // ============================================================
    // MOVEMENTS
    // ============================================================
    async addMovement(assetId: number, data: AssetMovementInput): Promise<any> {
        const asset = await this.repository.findAssetById(assetId);
        if (!asset) {
            throw new HttpError(404, 'Aset tidak ditemukan', 'ASSET_NOT_FOUND', true);
        }

        const movement = await this.repository.createMovement({
            asset_id: assetId,
            movement_date: data.movement_date,
            from_branch_id: asset.branch_id,
            to_branch_id: data.to_branch_id ?? null,
            from_location: asset.location,
            to_location: data.to_location ?? null,
            from_responsible_user_id: asset.responsible_user_id,
            to_responsible_user_id: data.to_responsible_user_id ?? null,
            from_responsible_name: asset.responsible_name,
            to_responsible_name: data.to_responsible_name ?? null,
            notes: data.notes ?? null,
            created_by: data.created_by ?? null,
        });

        await this.repository.updateAsset(assetId, {
            branch_id: data.to_branch_id ?? null,
            location: data.to_location ?? null,
            responsible_user_id: data.to_responsible_user_id ?? null,
            responsible_name: data.to_responsible_name ?? null,
        });

        return movement;
    }

    async getMovements(assetId: number): Promise<any[]> {
        const asset = await this.repository.findAssetById(assetId);
        if (!asset) {
            throw new HttpError(404, 'Aset tidak ditemukan', 'ASSET_NOT_FOUND', true);
        }
        return await this.repository.findMovementsByAsset(assetId);
    }
}
