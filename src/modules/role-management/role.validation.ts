import { z } from 'zod';

export const roleSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, { message: 'Name is required' }),
        description: z.string().trim().min(1, { message: 'Description is required' }),
    }),
});
