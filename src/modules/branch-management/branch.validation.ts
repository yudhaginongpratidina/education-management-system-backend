import { z } from 'zod';

export const createBranchSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        address: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        radius: z.string().optional(),
    }),
});

export const updateBranchSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        radius: z.string().optional(),
    }),
});
