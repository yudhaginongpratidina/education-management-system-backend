import { z } from 'zod';

export const roleMenuSchema = z.object({
    body: z.object({
        menu_slug: z.string().min(1, 'Menu slug is required'),
    }),
});

export const syncMenuSchema = z.object({
    body: z.object({
        menu_slugs: z.array(z.string()).min(0, 'At least one menu slug is required'),
    }),
});
