import { z } from 'zod';

const statusEnum = z.enum([
    'PRESENT',
    'ABSENT',
    'SICK',
    'LEAVE',
    'REMOTE',
    'OFFICIAL_DUTY',
    'HOLIDAY',
    'LATE',
]);

export const recordManualAttendanceSchema = z.object({
    body: z.object({
        teacher_id: z.coerce.number().positive('ID Guru harus berupa angka positif'),
        branch_id: z.coerce.number().positive('ID Cabang harus berupa angka positif'),
        attendance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
        status: statusEnum,
        check_in_at: z.string().nullable().optional(),
        check_in_photo: z.string().nullable().optional(),
        check_out_at: z.string().nullable().optional(),
        check_out_photo: z.string().nullable().optional(),
        notes: z.string().max(255).nullable().optional(),
        is_approved: z.boolean().optional().default(true),
    }),
});

export const updateManualAttendanceSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive(),
    }),
    body: z.object({
        teacher_id: z.coerce.number().positive().optional(),
        branch_id: z.coerce.number().positive().optional(),
        attendance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        status: statusEnum.optional(),
        check_in_at: z.string().nullable().optional(),
        check_in_photo: z.string().nullable().optional(),
        check_out_at: z.string().nullable().optional(),
        check_out_photo: z.string().nullable().optional(),
        notes: z.string().max(255).nullable().optional(),
        is_approved: z.boolean().optional(),
    }),
});

export const getManualAttendanceSchema = z.object({
    query: z.object({
        teacher_id: z.coerce.number().optional(),
        branch_id: z.coerce.number().optional(),
        status: statusEnum.optional(),
        date: z.string().optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
    }),
});
