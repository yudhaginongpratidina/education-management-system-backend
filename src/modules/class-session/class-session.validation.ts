import { z } from 'zod';
import {
    attendanceStatusSchema,
    dateSchema,
    idParam,
    sessionStatusSchema,
    timeSchema,
} from '../../shared/class/class.validation';

// ============================================================
// CLASS SESSIONS
// ============================================================
export const createClassSessionSchema = z
    .object({
        params: z.object({ classId: idParam }),
        body: z.object({
            scheduled_date: dateSchema,
            start_time: timeSchema,
            end_time: timeSchema,
            teacher_id: z.number().int().positive(),
            status: sessionStatusSchema.optional(),
            notes: z.string().max(500).optional().nullable(),
            student_program_ids: z.array(z.number().int().positive()).optional(),
        }),
    })
    .refine((data) => data.body.end_time > data.body.start_time, {
        message: 'end_time must be greater than start_time',
        path: ['body', 'end_time'],
    });

export const updateSessionSchema = z.object({
    params: z.object({ id: idParam }),
    body: z
        .object({
            scheduled_date: dateSchema.optional(),
            start_time: timeSchema.optional(),
            end_time: timeSchema.optional(),
            teacher_id: z.number().int().positive().optional(),
            status: sessionStatusSchema.optional(),
            notes: z.string().max(500).optional().nullable(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const rescheduleSessionSchema = z
    .object({
        params: z.object({ id: idParam }),
        body: z.object({
            scheduled_date: dateSchema,
            start_time: timeSchema,
            end_time: timeSchema,
            teacher_id: z.number().int().positive(),
            notes: z.string().max(500).optional().nullable(),
        }),
    })
    .refine((data) => data.body.end_time > data.body.start_time, {
        message: 'end_time must be greater than start_time',
        path: ['body', 'end_time'],
    });

export const substituteTeacherSchema = z.object({
    params: z.object({ id: idParam }),
    body: z.object({
        teacher_id: z.number().int().positive(),
        notes: z.string().max(500).optional().nullable(),
    }),
});

export const sessionParamsSchema = z.object({
    params: z.object({ id: idParam }),
});

export const listSessionSchema = z.object({
    query: z.object({
        class_id: z.coerce.number().int().positive().optional(),
        teacher_id: z.coerce.number().int().positive().optional(),
        branch_id: z.coerce.number().int().positive().optional(),
        scheduled_date: dateSchema.optional(),
        date_from: dateSchema.optional(),
        date_to: dateSchema.optional(),
        status: sessionStatusSchema.optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    }),
});

export const calendarQuerySchema = z.object({
    query: z.object({
        class_id: z.coerce.number().int().positive().optional(),
        teacher_id: z.coerce.number().int().positive().optional(),
        branch_id: z.coerce.number().int().positive().optional(),
        date_from: dateSchema.optional(),
        date_to: dateSchema.optional(),
        status: sessionStatusSchema.optional(),
    }),
});

// ============================================================
// CLASS SESSION STUDENTS / ATTENDANCE
// ============================================================
export const addSessionStudentSchema = z.object({
    params: z.object({ sessionId: idParam }),
    body: z.object({
        student_program_id: z.number().int().positive(),
        attendance_status: attendanceStatusSchema.optional(),
        notes: z.string().max(500).optional().nullable(),
    }),
});

export const updateSessionStudentSchema = z.object({
    params: z.object({ sessionId: idParam, studentProgramId: idParam }),
    body: z
        .object({
            attendance_status: attendanceStatusSchema.optional(),
            notes: z.string().max(500).optional().nullable(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const attendanceSchema = z.object({
    params: z.object({ sessionId: idParam, studentProgramId: idParam }),
    body: z.object({
        attendance_status: attendanceStatusSchema,
        notes: z.string().max(500).optional().nullable(),
    }),
});

export const bulkAttendanceSchema = z.object({
    params: z.object({ sessionId: idParam }),
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

export const sessionStudentParamsSchema = z.object({
    params: z.object({ sessionId: idParam, studentProgramId: idParam }),
});

export const sessionIdParamsSchema = z.object({
    params: z.object({ sessionId: idParam }),
});

// ============================================================
// SESSION GENERATION
// ============================================================
export const generateSessionsSchema = z.object({
    params: z.object({ classId: idParam }),
    body: z.object({
        from: dateSchema,
        to: dateSchema,
    }),
});
