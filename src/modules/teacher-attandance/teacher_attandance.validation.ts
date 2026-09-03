import { z } from 'zod';

export const createAttendanceSchema = z.object({
    body: z.object({
        teacher_id: z.number(),
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
        attendance_date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        check_in_at: z.string().datetime().optional().nullable(),
        check_in_photo: z.string().optional().nullable(),
        check_out_at: z.string().datetime().optional().nullable(),
        check_out_photo: z.string().optional().nullable(),
        check_in_latitude: z.number().optional().nullable(),
        check_in_longitude: z.number().optional().nullable(),
        check_out_latitude: z.number().optional().nullable(),
        check_out_longitude: z.number().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateAttendanceSchema = createAttendanceSchema.partial().extend({
    id: z.number(),
});
