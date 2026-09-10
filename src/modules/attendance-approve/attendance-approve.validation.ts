import { z } from 'zod';

export const approveAttendanceSchema = z.object({
    params: z.object({
        id: z.coerce.number(),
    }),
    body: z.object({
        is_approved: z.boolean(),
        notes: z.string().optional().nullable(),
    }),
});
