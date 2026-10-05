import { z } from 'zod';
import { dateSchema } from '../../shared/class/class.validation';

export const listRescheduleSchema = z.object({
    query: z.object({
        type: z.enum(['SESSION', 'TEACHER', 'STUDENT']).optional(),
        class_id: z.coerce.number().int().positive().optional(),
        student_program_id: z.coerce.number().int().positive().optional(),
        date_from: dateSchema.optional(),
        date_to: dateSchema.optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    }),
});
