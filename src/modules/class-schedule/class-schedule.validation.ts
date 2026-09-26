import { z } from 'zod';
import { dateSchema, idParam, timeSchema } from '../../shared/class/class.validation';

// ============================================================
// CLASS SCHEDULES
// ============================================================
export const createClassScheduleSchema = z
    .object({
        params: z.object({ classId: idParam }),
        body: z.object({
            day_of_week: z.number().int().min(1).max(7),
            start_time: timeSchema,
            end_time: timeSchema,
            effective_from: dateSchema,
            effective_until: dateSchema.optional().nullable(),
            is_active: z.boolean().optional(),
        }),
    })
    .refine((data) => data.body.end_time > data.body.start_time, {
        message: 'end_time must be greater than start_time',
        path: ['body', 'end_time'],
    })
    .refine(
        (data) =>
            !data.body.effective_until || data.body.effective_from <= data.body.effective_until,
        {
            message: 'effective_from must be before or equal to effective_until',
            path: ['body', 'effective_until'],
        },
    );

export const updateClassScheduleSchema = z
    .object({
        params: z.object({ classId: idParam, id: idParam }),
        body: z
            .object({
                day_of_week: z.number().int().min(1).max(7).optional(),
                start_time: timeSchema.optional(),
                end_time: timeSchema.optional(),
                effective_from: dateSchema.optional(),
                effective_until: dateSchema.optional().nullable(),
                is_active: z.boolean().optional(),
            })
            .refine((data) => Object.keys(data).length > 0, {
                message: 'At least one field is required',
            }),
    })
    .refine(
        (data) =>
            !data.body.start_time ||
            !data.body.end_time ||
            data.body.end_time > data.body.start_time,
        {
            message: 'end_time must be greater than start_time',
            path: ['body', 'end_time'],
        },
    );

export const classScheduleParamsSchema = z.object({
    params: z.object({ classId: idParam, id: idParam }),
});
