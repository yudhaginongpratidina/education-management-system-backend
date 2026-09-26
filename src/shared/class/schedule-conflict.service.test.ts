import { describe, expect, test } from 'bun:test';
import { ScheduleConflictService, SessionConflictService } from './schedule-conflict.service';

describe('SessionConflictService', () => {
    test('throws CLASS_SCHEDULE_CONFLICT when a session overlaps', async () => {
        const sessionRepo = { findClassConflicts: async () => [{ id: 1 }] } as any;
        const service = new SessionConflictService(sessionRepo, {} as any);
        await expect(
            service.checkClassSessionConflict(1, '2026-10-01', '08:00:00', '09:00:00'),
        ).rejects.toMatchObject({ code: 'CLASS_SCHEDULE_CONFLICT' });
    });

    test('throws TEACHER_SCHEDULE_CONFLICT when a teacher overlaps', async () => {
        const sessionRepo = { findTeacherConflicts: async () => [{ id: 1 }] } as any;
        const service = new SessionConflictService(sessionRepo, {} as any);
        await expect(
            service.checkTeacherSessionConflict(1, '2026-10-01', '08:00:00', '09:00:00'),
        ).rejects.toMatchObject({ code: 'TEACHER_SCHEDULE_CONFLICT' });
    });

    test('throws STUDENT_SCHEDULE_CONFLICT when a student overlaps', async () => {
        const studentRepo = { findStudentConflicts: async () => [{ id: 1 }] } as any;
        const service = new SessionConflictService({} as any, studentRepo);
        await expect(
            service.checkStudentSessionConflict(1, '2026-10-01', '08:00:00', '09:00:00'),
        ).rejects.toMatchObject({ code: 'STUDENT_SCHEDULE_CONFLICT' });
    });
});

describe('ScheduleConflictService', () => {
    test('throws CLASS_SCHEDULE_CONFLICT for overlapping recurring schedules', async () => {
        const scheduleRepo = { findConflicts: async () => [{ id: 1 }] } as any;
        const service = new ScheduleConflictService(scheduleRepo);
        await expect(
            service.checkClassScheduleConflict(1, 1, '08:30:00', '09:30:00', '2026-01-01', null),
        ).rejects.toMatchObject({ code: 'CLASS_SCHEDULE_CONFLICT' });
    });
});
