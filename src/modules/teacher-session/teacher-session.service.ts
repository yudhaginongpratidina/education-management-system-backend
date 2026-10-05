import { HttpError } from '../../core/errors/http.error';
import type { DatabaseClient } from '../../config/database/types';
import type {
    ClassSessionStatus,
    Pagination,
    SessionAttendanceStatus,
} from '../../shared/class/class.types';
import { today } from '../../shared/class/class.util';
import type { IClassSessionStudentRepository } from '../class-session/class-session.interface';
import type {
    ITeacherSessionRepository,
    ITeacherSessionService,
    TeacherSessionFilter,
    TeacherSessionPeriod,
} from './teacher-session.interface';

const ALLOWED_TRANSITIONS: Record<ClassSessionStatus, ClassSessionStatus[]> = {
    SCHEDULED: ['ONGOING', 'CANCELLED', 'RESCHEDULED'],
    ONGOING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    RESCHEDULED: [],
};

const SESSION_ATTENDANCE_STATUSES: SessionAttendanceStatus[] = [
    'PRESENT',
    'ABSENT',
    'SICK',
    'PERMISSION',
    'RESCHEDULED',
];

const CLOSED_SESSION_STATUSES: ClassSessionStatus[] = ['COMPLETED', 'CANCELLED', 'RESCHEDULED'];

// --- date helpers (UTC, keeps YYYY-MM-DD strings stable) ---
const addDays = (date: string, days: number): string => {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
};

const startOfWeek = (date: string): string => {
    const value = new Date(`${date}T00:00:00Z`);
    const offset = (value.getUTCDay() + 6) % 7; // Monday = 0
    return addDays(date, -offset);
};

const endOfMonth = (date: string): string => {
    const [year, month] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
};

export class TeacherSessionService implements ITeacherSessionService {
    constructor(
        private readonly repository: ITeacherSessionRepository,
        private readonly sessionStudentRepository: IClassSessionStudentRepository,
        private readonly db: DatabaseClient,
    ) {}

    // ---------- helpers ----------
    async resolveTeacher(userId: number): Promise<any> {
        const teacher = await this.repository.findTeacherByUserId(userId);
        if (!teacher) {
            throw new HttpError(
                403,
                'No teacher profile is linked to this account',
                'TEACHER_PROFILE_NOT_FOUND',
                true,
            );
        }
        return teacher;
    }

    private async getSessionOrFail(sessionId: number): Promise<any> {
        const session = await this.repository.findById(sessionId);
        if (!session) {
            throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND', true);
        }
        return session;
    }

    private assertSessionOwner(session: any, teacherId: number): void {
        if (Number(session.teacher_id) !== Number(teacherId)) {
            throw new HttpError(
                403,
                'You are not the teacher of this session',
                'SESSION_NOT_OWNED',
                true,
            );
        }
    }

    private async getOwnedSessionOrFail(userId: number, sessionId: number): Promise<any> {
        const teacher = await this.resolveTeacher(userId);
        const session = await this.getSessionOrFail(sessionId);
        this.assertSessionOwner(session, teacher.id);
        return session;
    }

    private assertValidAttendance(status: string): void {
        if (!SESSION_ATTENDANCE_STATUSES.includes(status as SessionAttendanceStatus)) {
            throw new HttpError(400, 'Invalid attendance status', 'BAD_REQUEST', true, {
                allowed: SESSION_ATTENDANCE_STATUSES,
            });
        }
    }

    private assertSessionAcceptsAttendance(session: any): void {
        if (CLOSED_SESSION_STATUSES.includes(session.status)) {
            throw new HttpError(
                409,
                'Attendance can no longer be updated for this session',
                'INVALID_SESSION_STATUS_TRANSITION',
                true,
            );
        }
    }

    // Translate a period shortcut into a concrete date window.
    private applyPeriod(filter: TeacherSessionFilter): TeacherSessionFilter {
        const period = filter.period;
        if (!period) return filter;

        const current = today();
        const next = { ...filter };

        switch (period as TeacherSessionPeriod) {
            case 'today':
                next.date_from = current;
                next.date_to = current;
                break;
            case 'week':
                next.date_from = startOfWeek(current);
                next.date_to = addDays(startOfWeek(current), 6);
                break;
            case 'month':
                next.date_from = `${current.slice(0, 7)}-01`;
                next.date_to = endOfMonth(current);
                break;
            case 'upcoming':
                next.date_from = current;
                break;
            case 'past':
                next.date_to = addDays(current, -1);
                break;
        }

        delete next.period;
        return next;
    }

    // ---------- reads ----------
    async getMySessions(
        userId: number,
        filter: TeacherSessionFilter,
        pagination?: Pagination,
    ): Promise<any[]> {
        const teacher = await this.resolveTeacher(userId);
        const scoped = this.applyPeriod({ ...filter, teacher_id: teacher.id });
        return await this.repository.findAll(scoped, pagination);
    }

    async getMySummary(userId: number, filter: TeacherSessionFilter): Promise<any> {
        const teacher = await this.resolveTeacher(userId);
        const scoped = this.applyPeriod(filter);
        const rows = await this.repository.findSummary(teacher.id, scoped);

        const byStatus: Record<string, number> = {
            SCHEDULED: 0,
            ONGOING: 0,
            COMPLETED: 0,
            CANCELLED: 0,
            RESCHEDULED: 0,
        };
        let total = 0;
        for (const row of rows) {
            const count = Number(row.count);
            byStatus[row.status] = count;
            total += count;
        }

        return {
            total,
            by_status: byStatus,
            scheduled: byStatus.SCHEDULED,
            ongoing: byStatus.ONGOING,
            completed: byStatus.COMPLETED,
            cancelled: byStatus.CANCELLED,
            rescheduled: byStatus.RESCHEDULED,
        };
    }

    async getMySchedule(userId: number): Promise<any[]> {
        const teacher = await this.resolveTeacher(userId);
        return await this.repository.findSchedule(teacher.id);
    }

    async getMySessionDetail(userId: number, sessionId: number): Promise<any> {
        const session = await this.getOwnedSessionOrFail(userId, sessionId);
        const participants = await this.sessionStudentRepository.findBySession(sessionId);
        return { ...session, participants };
    }

    async getMySessionStudents(userId: number, sessionId: number): Promise<any[]> {
        await this.getOwnedSessionOrFail(userId, sessionId);
        return await this.sessionStudentRepository.findBySession(sessionId);
    }

    // ---------- writes ----------
    async updateMySessionStatus(
        userId: number,
        sessionId: number,
        status: ClassSessionStatus,
    ): Promise<any> {
        const session = await this.getOwnedSessionOrFail(userId, sessionId);

        if (status !== session.status) {
            const allowed = ALLOWED_TRANSITIONS[session.status as ClassSessionStatus] ?? [];
            if (!allowed.includes(status)) {
                throw new HttpError(
                    409,
                    `Cannot change session status from ${session.status} to ${status}`,
                    'INVALID_SESSION_STATUS_TRANSITION',
                    true,
                );
            }
        }

        return await this.repository.updateStatus(sessionId, status);
    }

    async updateMyAttendance(
        userId: number,
        sessionId: number,
        studentProgramId: number,
        data: { attendance_status: SessionAttendanceStatus; notes?: string | null },
    ): Promise<any> {
        const session = await this.getOwnedSessionOrFail(userId, sessionId);
        this.assertSessionAcceptsAttendance(session);
        this.assertValidAttendance(data.attendance_status);

        const participant = await this.sessionStudentRepository.findParticipant(
            sessionId,
            studentProgramId,
        );
        if (!participant) {
            throw new HttpError(
                404,
                'Student is not a participant of this session',
                'STUDENT_NOT_IN_SESSION',
                true,
            );
        }

        return await this.sessionStudentRepository.update(sessionId, studentProgramId, {
            attendance_status: data.attendance_status,
            notes: data.notes,
        });
    }

    async bulkUpdateMyAttendance(
        userId: number,
        sessionId: number,
        records: {
            student_program_id: number;
            attendance_status: SessionAttendanceStatus;
            notes?: string | null;
        }[],
    ): Promise<any[]> {
        const session = await this.getOwnedSessionOrFail(userId, sessionId);
        this.assertSessionAcceptsAttendance(session);

        for (const record of records) {
            this.assertValidAttendance(record.attendance_status);
            const participant = await this.sessionStudentRepository.findParticipant(
                sessionId,
                record.student_program_id,
            );
            if (!participant) {
                throw new HttpError(
                    404,
                    'Student is not a participant of this session',
                    'STUDENT_NOT_IN_SESSION',
                    true,
                );
            }
        }

        return await this.db.transaction!(async (tx) => {
            const updated: any[] = [];
            for (const record of records) {
                updated.push(
                    await this.sessionStudentRepository.update(
                        sessionId,
                        record.student_program_id,
                        {
                            attendance_status: record.attendance_status,
                            notes: record.notes,
                        },
                        tx,
                    ),
                );
            }
            return updated;
        });
    }
}
