// Shared zod primitives for the class domain modules.
import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export const timeSchema = z
    .string()
    .regex(timeRegex, 'Invalid time format, expected HH:MM or HH:MM:SS');

export const dateSchema = z.string().date('Invalid date format, expected YYYY-MM-DD');

export const classStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const classTeacherRoleSchema = z.enum(['PRIMARY', 'SUBSTITUTE']);
export const sessionStatusSchema = z.enum([
    'SCHEDULED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED',
]);
export const attendanceStatusSchema = z.enum([
    'PRESENT',
    'ABSENT',
    'SICK',
    'PERMISSION',
    'RESCHEDULED',
]);

export const idParam = z.coerce.number().int().positive();

// Params for routes nested under a class: /classes/:classId/...
export const classIdParamsSchema = z.object({
    params: z.object({ classId: idParam }),
});
