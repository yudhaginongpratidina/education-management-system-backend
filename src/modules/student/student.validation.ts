import { z } from 'zod';

// Accepts a plain date (YYYY-MM-DD) as stored in the `students.birth_date` DATE column,
// as well as a full ISO 8601 datetime for backwards compatibility.
const birthDateSchema = z.union([z.string().date(), z.string().datetime({ offset: true })], {
    error: 'Invalid birth_date format, expected YYYY-MM-DD or ISO 8601 datetime',
});

export const createStudentSchema = z.object({
    body: z.object({
        full_name: z.string().min(1, 'Full name is required'),
        address: z.string().optional(),
        place_birth: z.string().optional(),
        birth_date: birthDateSchema.optional(), // Assumes ISO string
        school_level: z.string().optional(),
        father_name: z.string().optional(),
        mother_name: z.string().optional(),
        guardian_name: z.string().optional(),
        guardian_phone_number: z.string().optional(),
        instagram: z.string().optional(),
        information_source: z.string().optional(),
        photos_of_children_may_be_posted: z.boolean().default(false),
    }),
});

export const updateStudentSchema = z.object({
    body: z.object({
        full_name: z.string().optional(),
        address: z.string().optional(),
        place_birth: z.string().optional(),
        birth_date: birthDateSchema.optional(),
        school_level: z.string().optional(),
        father_name: z.string().optional(),
        mother_name: z.string().optional(),
        guardian_name: z.string().optional(),
        guardian_phone_number: z.string().optional(),
        instagram: z.string().optional(),
        information_source: z.string().optional(),
        photos_of_children_may_be_posted: z.boolean().optional(),
    }),
});
