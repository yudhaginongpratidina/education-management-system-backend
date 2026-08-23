import { z } from 'zod';

export const programPackageSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        duration_months: z.number().int().min(1, 'Duration must be 1 or greater'),
        sessions_count: z.number().int().min(1, 'Sessions count must be 1 or greater'),
        session_period: z.enum(['WEEK', 'MONTH', 'DURATION']),
        normal_price: z.number().min(0, 'Normal price must be 0 or greater'),
        selling_price: z.number().min(0, 'Selling price must be 0 or greater'),
        bonus_duration_months: z
            .number()
            .int()
            .min(0, 'Bonus duration must be 0 or greater')
            .optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
