import { z } from 'zod';
import { classStatusSchema, idParam } from '../../shared/class/class.validation';

// ============================================================
// CLASSES
// ============================================================
export const createClassSchema = z.object({
    body: z.object({
        branch_id: z.number().int().positive('branch_id is required'),
        name: z.string().min(1, 'Name is required'),
        code: z.string().min(1, 'Code is required'),
        description: z.string().max(255).optional().nullable(),
        status: classStatusSchema.optional(),
    }),
});

export const updateClassSchema = z.object({
    params: z.object({ id: idParam }),
    body: z
        .object({
            branch_id: z.number().int().positive().optional(),
            name: z.string().min(1).optional(),
            code: z.string().min(1).optional(),
            description: z.string().max(255).optional().nullable(),
            status: classStatusSchema.optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const getClassSchema = z.object({
    params: z.object({ id: idParam }),
});

export const listClassSchema = z.object({
    query: z.object({
        branch_id: z.coerce.number().int().positive().optional(),
        status: classStatusSchema.optional(),
        search: z.string().optional(),
        sort_by: z.enum(['name', 'code', 'status', 'created_at', 'updated_at']).optional(),
        sort_order: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    }),
});
