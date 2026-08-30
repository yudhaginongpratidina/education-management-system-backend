import { z } from 'zod';

export const getStorageSchema = z.object({
    params: z.object({
        slug: z.string(),
    }),
});

export const deleteStorageSchema = z.object({
    params: z.object({
        slug: z.string(),
    }),
});
