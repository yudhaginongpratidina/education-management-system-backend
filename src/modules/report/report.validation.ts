import { z } from 'zod';
import { dateSchema } from '../../shared/class/class.validation';

export const reportQuerySchema = z.object({
    query: z.object({
        date_from: dateSchema.optional(),
        date_to: dateSchema.optional(),
        branch_id: z.coerce.number().int().positive().optional(),
        teacher_id: z.coerce.number().int().positive().optional(),
        class_id: z.coerce.number().int().positive().optional(),
        status: z.string().optional(),
        type: z.enum(['SESSION', 'TEACHER', 'STUDENT']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    }),
});
