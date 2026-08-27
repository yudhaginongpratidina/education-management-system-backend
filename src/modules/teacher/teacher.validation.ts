import { z } from 'zod';

export const createTeacherSchema = z.object({
    body: z.object({
        full_name: z.string().min(1, 'Full name is required'),
        email: z.string().email('Invalid email address'),
        phone_number: z.string().optional(),
        address: z.string().optional(),
        place_and_dob: z.string().optional(),
        last_education: z.string().optional(),
        photo: z.string().optional(),
    }),
});

export const getTeacherSchema = z.object({
    query: z.object({
        full_name: z.string().optional(),
        slug: z.string().optional(),
        phone_number: z.string().optional(),
    }),
});
export const updateTeacherSchema = z.object({
    body: z.object({
        full_name: z.string().min(1, 'Full name is required'),
        user_id: z.string().min(1, 'User ID is required'),
        phone_number: z.string().optional(),
        address: z.string().optional(),
        place_and_dob: z.string().optional(),
        last_education: z.string().optional(),
        photo: z.string().optional(),
    }),
});
