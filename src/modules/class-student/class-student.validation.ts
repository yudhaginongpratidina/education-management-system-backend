import { z } from 'zod';
import { dateSchema, idParam } from '../../shared/class/class.validation';

// ============================================================
// CLASS STUDENTS
// ============================================================
export const addClassStudentSchema = z.object({
    params: z.object({ classId: idParam }),
    body: z.object({
        student_program_id: z.number().int().positive(),
        joined_at: dateSchema.optional(),
    }),
});

export const updateClassStudentSchema = z.object({
    params: z.object({ classId: idParam, studentProgramId: idParam }),
    body: z
        .object({
            joined_at: dateSchema.optional(),
            left_at: dateSchema.optional().nullable(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const classStudentParamsSchema = z.object({
    params: z.object({ classId: idParam, studentProgramId: idParam }),
});
