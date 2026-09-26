import { z } from 'zod';

// Accepts a plain date (YYYY-MM-DD) as stored in the DATE columns `started_at` / `ended_at`,
// as well as a full ISO 8601 datetime for backwards compatibility.
const dateOrDatetimeSchema = z.union([z.string().date(), z.string().datetime({ offset: true })], {
    error: 'Invalid date format, expected YYYY-MM-DD or ISO 8601 datetime',
});

export const createStudentProgramSchema = z.object({
    body: z.object({
        student_id: z.number(),
        branch_id: z.number(),
        program_package_id: z.number(),
        program_level_id: z.number(),
        status: z.enum(['PENDING', 'TRIAL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']),
        started_at: dateOrDatetimeSchema.optional(),
        ended_at: dateOrDatetimeSchema.optional(),
        normal_price: z.number(),
        selling_price: z.number(),
        notes: z.string().optional(),
    }),
});

export const updateStudentProgramSchema = z.object({
    body: z.object({
        student_id: z.number().optional(),
        branch_id: z.number().optional(),
        program_package_id: z.number().optional(),
        program_level_id: z.number().optional(),
        status: z
            .enum(['PENDING', 'TRIAL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'])
            .optional(),
        started_at: dateOrDatetimeSchema.optional(),
        ended_at: dateOrDatetimeSchema.optional(),
        normal_price: z.number().optional(),
        selling_price: z.number().optional(),
        notes: z.string().optional(),
    }),
});
