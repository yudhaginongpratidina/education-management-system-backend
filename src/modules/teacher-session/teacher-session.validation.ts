import { z } from 'zod';
import {
    attendanceStatusSchema,
    dateSchema,
    idParam,
    sessionStatusSchema,
} from '../../shared/class/class.validation';

// ============================================================
// MY SESSIONS (teacher scoped)
// ============================================================
export const teacherSessionListSchema = z.object({
    query: z.object({
        scheduled_date: dateSchema.optional(),
        date_from: dateSchema.optional(),
        date_to: dateSchema.optional(),
        status: sessionStatusSchema.optional(),
        period: z.enum(['today', 'week', 'month', 'upcoming', 'past']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    }),
});

export const teacherSessionSummarySchema = z.object({
    query: z.object({
        scheduled_date: dateSchema.optional(),
        date_from: dateSchema.optional(),
        date_to: dateSchema.optional(),
        period: z.enum(['today', 'week', 'month', 'upcoming', 'past']).optional(),
    }),
});

export const teacherSessionParamsSchema = z.object({
    params: z.object({ id: idParam }),
});

export const teacherSessionStatusSchema = z.object({
    params: z.object({ id: idParam }),
    body: z.object({
        status: sessionStatusSchema,
    }),
});

// ============================================================
// STUDENT ATTENDANCE
// ============================================================
export const teacherAttendanceSchema = z.object({
    params: z.object({ id: idParam, studentProgramId: idParam }),
    body: z.object({
        attendance_status: attendanceStatusSchema,
        notes: z.string().max(500).optional().nullable(),
    }),
});

export const teacherBulkAttendanceSchema = z.object({
    params: z.object({ id: idParam }),
    body: z.object({
        records: z
            .array(
                z.object({
                    student_program_id: z.number().int().positive(),
                    attendance_status: attendanceStatusSchema,
                    notes: z.string().max(500).optional().nullable(),
                }),
            )
            .min(1, 'At least one attendance record is required'),
    }),
});

export const teacherSessionStudentParamsSchema = z.object({
    params: z.object({ id: idParam, studentProgramId: idParam }),
});
