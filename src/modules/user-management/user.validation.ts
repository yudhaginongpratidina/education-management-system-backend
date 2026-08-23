import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        full_name: z.string().min(1, 'Full name is required'),
        email: z.string().email('Invalid email address'),
        password_hash: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.string().optional().nullable(),
        avatar: z.string().optional().nullable(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        full_name: z.string().min(1, 'Full name is required'),
        email: z.string().email('Invalid email address'),
        role: z.string().optional().nullable(),
        avatar: z.string().optional().nullable(),
    }),
});
