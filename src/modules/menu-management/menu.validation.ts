import { z } from 'zod';

export const menuSchema = z.object({
    body: z.object({
        parent_id: z.number().optional(),
        name: z.string().trim().min(1, { message: 'Name is required' }),
        type: z.enum(['GROUP', 'ITEM']),
        icon: z.string().optional(),
        url: z.string().optional(),
        description: z.string().trim().min(1, { message: 'Description is required' }),
        sort_order: z.number().optional(),
        is_active: z.boolean().optional(),
    }),
});

export const reorderMenuSchema = z.object({
    body: z.object({
        orders: z
            .array(
                z.object({
                    id: z.number(),
                    sort_order: z.number(),
                    parent_id: z.number().nullable().optional(),
                }),
            )
            .optional(),
        ids: z.array(z.number()).optional(),
    }),
});
