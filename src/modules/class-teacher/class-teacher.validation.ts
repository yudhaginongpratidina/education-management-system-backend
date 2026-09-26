import { z } from 'zod';
import { classTeacherRoleSchema, dateSchema, idParam } from '../../shared/class/class.validation';

// ============================================================
// CLASS TEACHERS
// ============================================================
export const addClassTeacherSchema = z.object({
    params: z.object({ classId: idParam }),
    body: z
        .object({
            teacher_id: z.number().int().positive(),
            role: classTeacherRoleSchema.optional(),
            started_at: dateSchema,
            ended_at: dateSchema.optional().nullable(),
        })
        .refine((data) => !data.ended_at || data.started_at <= data.ended_at, {
            message: 'started_at must be before or equal to ended_at',
            path: ['ended_at'],
        }),
});

export const updateClassTeacherSchema = z.object({
    params: z.object({ classId: idParam, id: idParam }),
    body: z
        .object({
            role: classTeacherRoleSchema.optional(),
            started_at: dateSchema.optional(),
            ended_at: dateSchema.optional().nullable(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const classTeacherParamsSchema = z.object({
    params: z.object({ classId: idParam, id: idParam }),
});
