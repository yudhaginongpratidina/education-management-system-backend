import { z } from 'zod';

export const programLevelSchema = z.object({
    body: z.object({
        level: z.number().int().min(1, 'Level must be a positive integer'),
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
