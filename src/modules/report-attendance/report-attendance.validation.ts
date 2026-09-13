import { z } from 'zod';

export const reportAttendanceByBranchIdSchema = z.object({
    params: z.object({
        branch_id: z.string().transform(Number),
    }),
    query: z.object({
        month: z
            .string()
            .regex(/^\d{4}-\d{2}$/, 'Invalid month format, expected YYYY-MM')
            .optional(),
    }),
});

export const reportAttendanceByTeacherIdSchema = z.object({
    params: z.object({
        teacher_id: z.string().transform(Number),
    }),
    query: z.object({
        month: z
            .string()
            .regex(/^\d{4}-\d{2}$/, 'Invalid month format, expected YYYY-MM')
            .optional(),
    }),
});
