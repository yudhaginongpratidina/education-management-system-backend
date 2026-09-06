import { z } from 'zod';

export const createAttendanceSchema = z.object({
    body: z.object({
        teacher_id: z.number(),
        branch_id: z.number(),
        status: z.enum([
            'PRESENT',
            'ABSENT',
            'SICK',
            'LEAVE',
            'REMOTE',
            'OFFICIAL_DUTY',
            'HOLIDAY',
            'LATE',
        ]),
        attendance_date: z.string(), // Allow flexible formats for now, or use datetime
        check_in_at: z.string().datetime().optional().nullable(),
        check_in_photo: z.string().optional().nullable(),
        check_out_at: z.string().datetime().optional().nullable(),
        check_out_photo: z.string().optional().nullable(),
        check_in_latitude: z.coerce.number().optional().nullable(),
        check_in_longitude: z.coerce.number().optional().nullable(),
        check_out_latitude: z.coerce.number().optional().nullable(),
        check_out_longitude: z.coerce.number().optional().nullable(),
        notes: z.string().optional().nullable(),
        is_approved: z.boolean().optional(),
    }),
});

export const updateAttendanceSchema = z.object({
    params: z.object({
        id: z.coerce.number(),
    }),
    body: createAttendanceSchema.shape.body.partial(),
});
