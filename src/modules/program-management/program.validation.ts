import { z } from 'zod';

export const programSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        requirements: z.string().optional(),
        price_per_session: z.number().min(0, 'Price must be 0 or greater'),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
