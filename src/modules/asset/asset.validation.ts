import { z } from 'zod';
import { dateSchema, idParam } from '../../shared/class/class.validation';

const conditionSchema = z.enum(['GOOD', 'FAIR', 'DAMAGED', 'BROKEN']);
const statusSchema = z.enum(['ACTIVE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED']);

// ---------------- categories ----------------
export const assetCategoryParamsSchema = z.object({
    params: z.object({ id: idParam }),
});

export const createAssetCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
        code_prefix: z.string().max(10).optional().nullable(),
        description: z.string().max(255).optional().nullable(),
        is_active: z.boolean().optional(),
    }),
});

export const updateAssetCategorySchema = z.object({
    params: z.object({ id: idParam }),
    body: z
        .object({
            name: z.string().min(1).max(100).optional(),
            code_prefix: z.string().max(10).optional().nullable(),
            description: z.string().max(255).optional().nullable(),
            is_active: z.boolean().optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const listAssetCategoriesSchema = z.object({
    query: z.object({ search: z.string().optional() }),
});

// ---------------- assets ----------------
export const listAssetsSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        category_id: z.coerce.number().int().positive().optional(),
        branch_id: z.coerce.number().int().positive().optional(),
        status: statusSchema.optional(),
        condition: conditionSchema.optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
        sort: z.string().optional(),
        order: z.enum(['asc', 'desc']).optional(),
    }),
});

export const assetParamsSchema = z.object({
    params: z.object({ id: idParam }),
});

export const createAssetSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama aset wajib diisi').max(150),
        category_id: z.number().int().positive(),
        branch_id: z.number().int().positive().optional().nullable(),
        location: z.string().max(150).optional().nullable(),
        purchase_date: dateSchema.optional().nullable(),
        purchase_price: z.number().min(0).optional(),
        useful_life_years: z.number().int().min(0).optional().nullable(),
        condition: conditionSchema.optional(),
        status: statusSchema.optional(),
        responsible_user_id: z.number().int().positive().optional().nullable(),
        responsible_name: z.string().max(150).optional().nullable(),
        notes: z.string().max(500).optional().nullable(),
    }),
});

export const updateAssetSchema = z.object({
    params: z.object({ id: idParam }),
    body: z
        .object({
            name: z.string().min(1).max(150).optional(),
            category_id: z.number().int().positive().optional(),
            branch_id: z.number().int().positive().optional().nullable(),
            location: z.string().max(150).optional().nullable(),
            purchase_date: dateSchema.optional().nullable(),
            purchase_price: z.number().min(0).optional(),
            useful_life_years: z.number().int().min(0).optional().nullable(),
            condition: conditionSchema.optional(),
            status: statusSchema.optional(),
            responsible_user_id: z.number().int().positive().optional().nullable(),
            responsible_name: z.string().max(150).optional().nullable(),
            notes: z.string().max(500).optional().nullable(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const createAssetMovementSchema = z.object({
    params: z.object({ id: idParam }),
    body: z.object({
        movement_date: dateSchema,
        to_branch_id: z.number().int().positive().optional().nullable(),
        to_location: z.string().max(150).optional().nullable(),
        to_responsible_user_id: z.number().int().positive().optional().nullable(),
        to_responsible_name: z.string().max(150).optional().nullable(),
        notes: z.string().max(500).optional().nullable(),
    }),
});
