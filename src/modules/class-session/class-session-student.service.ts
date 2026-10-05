import { HttpError } from '../../core/errors/http.error';
import type { DatabaseClient } from '../../config/database/types';
import type { SessionAttendanceStatus } from '../../shared/class/class.types';
import type { ISessionConflictService } from '../../shared/class/schedule-conflict.service';
import { isDuplicateEntryError, toDateOnly } from '../../shared/class/class.util';
import {
    assertQuotaAvailable,
    assertWithinEnrollmentWindow,
} from '../../shared/class/enrollment-quota.util';
import type { ISessionRescheduleRepository } from '../session-reschedule/session-reschedule.interface';
import type {
    IClassSessionRepository,
    IClassSessionStudentRepository,
    IClassSessionStudentService,
} from './class-session.interface';

const SESSION_ATTENDANCE_STATUSES: SessionAttendanceStatus[] = [
    'PRESENT',
    'ABSENT',
    'SICK',
    'PERMISSION',
    'RESCHEDULED',
];

const CLOSED_SESSION_STATUSES = ['COMPLETED', 'CANCELLED', 'RESCHEDULED'];

export class ClassSessionStudentService implements IClassSessionStudentService {
    constructor(
        private readonly repository: IClassSessionStudentRepository,
        private readonly sessionRepository: IClassSessionRepository,
        private readonly conflictService: ISessionConflictService,
        private readonly db: DatabaseClient,
        private readonly rescheduleRepository?: ISessionRescheduleRepository,
    ) {}

    private async getSessionOrFail(sessionId: number): Promise<any> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND', true);
        }
        return session;
    }

    private assertSessionAcceptsParticipants(session: any): void {
        if (CLOSED_SESSION_STATUSES.includes(session.status)) {
            throw new HttpError(
                409,
                'Session is not in a state that accepts participants',
                'INVALID_SESSION_STATUS_TRANSITION',
                true,
            );
        }
    }

    private async getParticipantOrFail(sessionId: number, studentProgramId: number): Promise<any> {
        const participant = await this.repository.findParticipant(sessionId, studentProgramId);
        if (!participant) {
            throw new HttpError(
                404,
                'Student is not a participant of this session',
                'STUDENT_NOT_IN_SESSION',
                true,
            );
        }
        return participant;
    }

    async getSessionStudents(sessionId: number): Promise<any> {
        await this.getSessionOrFail(sessionId);
        return await this.repository.findBySession(sessionId);
    }

    async addSessionStudent(sessionId: number, data: any): Promise<any> {
        const session = await this.getSessionOrFail(sessionId);
        this.assertSessionAcceptsParticipants(session);

        const studentProgram = await this.repository.getStudentProgram(data.student_program_id);
        if (!studentProgram) {
            throw new HttpError(
                404,
                'Student program not found',
                'STUDENT_PROGRAM_NOT_FOUND',
                true,
            );
        }

        if (Number(studentProgram.branch_id) !== Number(session.branch_id)) {
            throw new HttpError(
                400,
                'Student program branch does not match class branch',
                'STUDENT_BRANCH_MISMATCH',
                true,
            );
        }

        const isMember = await this.repository.isMemberOfClass(
            session.class_id,
            data.student_program_id,
        );
        if (!isMember) {
            throw new HttpError(
                400,
                'Student is not an active member of this class',
                'STUDENT_NOT_IN_CLASS',
                true,
            );
        }

        // Package-driven eligibility: enrollment period + session quota.
        assertWithinEnrollmentWindow(studentProgram, toDateOnly(session.scheduled_date) as string);
        const quotaUsage = await this.repository.getQuotaUsage(data.student_program_id);
        assertQuotaAvailable(studentProgram, quotaUsage);

        await this.conflictService.checkStudentSessionConflict(
            data.student_program_id,
            session.scheduled_date,
            session.start_time,
            session.end_time,
            sessionId,
        );

        try {
            await this.repository.create({
                session_id: sessionId,
                student_program_id: data.student_program_id,
                attendance_status: data.attendance_status ?? 'ABSENT',
                notes: data.notes ?? null,
            });
        } catch (error) {
            if (isDuplicateEntryError(error)) {
                throw new HttpError(
                    409,
                    'Student is already a participant of this session',
                    'DUPLICATE_SESSION_STUDENT',
                    true,
                );
            }
            throw error;
        }

        return await this.repository.findParticipant(sessionId, data.student_program_id);
    }

    async updateSessionStudent(
        sessionId: number,
        studentProgramId: number,
        data: { attendance_status?: SessionAttendanceStatus; notes?: string | null },
    ): Promise<any> {
        await this.getSessionOrFail(sessionId);
        await this.getParticipantOrFail(sessionId, studentProgramId);

        if (data.attendance_status !== undefined) {
            this.assertValidAttendance(data.attendance_status);
        }

        return await this.repository.update(sessionId, studentProgramId, data);
    }

    async removeSessionStudent(sessionId: number, studentProgramId: number): Promise<any> {
        await this.getSessionOrFail(sessionId);
        await this.getParticipantOrFail(sessionId, studentProgramId);
        await this.repository.remove(sessionId, studentProgramId);
        return { session_id: sessionId, student_program_id: studentProgramId };
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

    async updateAttendance(
        sessionId: number,
        studentProgramId: number,
        data: { attendance_status: SessionAttendanceStatus; notes?: string | null },
    ): Promise<any> {
        const session = await this.getSessionOrFail(sessionId);
        this.assertSessionAcceptsAttendance(session);
        this.assertValidAttendance(data.attendance_status);
        await this.getParticipantOrFail(sessionId, studentProgramId);

        return await this.repository.update(sessionId, studentProgramId, {
            attendance_status: data.attendance_status,
            notes: data.notes,
        });
    }

    async bulkUpdateAttendance(
        sessionId: number,
        records: {
            student_program_id: number;
            attendance_status: SessionAttendanceStatus;
            notes?: string | null;
        }[],
    ): Promise<any> {
        const session = await this.getSessionOrFail(sessionId);
        this.assertSessionAcceptsAttendance(session);

        for (const record of records) {
            this.assertValidAttendance(record.attendance_status);
            await this.getParticipantOrFail(sessionId, record.student_program_id);
        }

        return await this.db.transaction!(async (tx) => {
            const updated: any[] = [];
            for (const record of records) {
                updated.push(
                    await this.repository.update(
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

    /**
     * Move a single student's participation from one session to another (make-up
     * session). The target must be open, belong to a class the student is an
     * active member of, fall inside the enrollment period, and be conflict free.
     */
    async rescheduleStudent(
        sessionId: number,
        studentProgramId: number,
        data: { target_session_id: number; reason?: string | null; created_by?: number | null },
    ): Promise<any> {
        const source = await this.getSessionOrFail(sessionId);
        this.assertSessionAcceptsParticipants(source);
        await this.getParticipantOrFail(sessionId, studentProgramId);

        const targetId = Number(data.target_session_id);
        if (!targetId) {
            throw new HttpError(
                400,
                'target_session_id is required',
                'TARGET_SESSION_REQUIRED',
                true,
            );
        }
        if (targetId === sessionId) {
            throw new HttpError(
                400,
                'Target session must differ from the current session',
                'SAME_SESSION',
                true,
            );
        }

        const target = await this.sessionRepository.findById(targetId);
        if (!target) {
            throw new HttpError(404, 'Target session not found', 'TARGET_SESSION_NOT_FOUND', true);
        }
        if (CLOSED_SESSION_STATUSES.includes(target.status)) {
            throw new HttpError(
                409,
                'Target session is not open',
                'INVALID_SESSION_STATUS_TRANSITION',
                true,
            );
        }

        const enrollment = await this.repository.getStudentProgram(studentProgramId);
        if (!enrollment) {
            throw new HttpError(
                404,
                'Student program not found',
                'STUDENT_PROGRAM_NOT_FOUND',
                true,
            );
        }

        const targetDate = toDateOnly(target.scheduled_date) as string;
        const startedAt = toDateOnly(enrollment.started_at);
        const endedAt = toDateOnly(enrollment.ended_at);
        if ((startedAt && targetDate < startedAt) || (endedAt && targetDate > endedAt)) {
            throw new HttpError(
                409,
                'Target session is outside the student enrollment period',
                'ENROLLMENT_WINDOW_EXCEEDED',
                true,
                { target_date: targetDate, started_at: startedAt, ended_at: endedAt },
            );
        }

        const isMember = await this.repository.isMemberOfClass(target.class_id, studentProgramId);
        if (!isMember) {
            throw new HttpError(
                400,
                'Student is not an active member of the target class',
                'STUDENT_NOT_IN_CLASS',
                true,
            );
        }

        const existingTarget = await this.repository.findParticipant(targetId, studentProgramId);
        if (existingTarget) {
            throw new HttpError(
                409,
                'Student is already a participant of the target session',
                'DUPLICATE_SESSION_STUDENT',
                true,
            );
        }

        await this.conflictService.checkStudentSessionConflict(
            studentProgramId,
            targetDate,
            target.start_time,
            target.end_time,
            targetId,
        );

        return await this.db.transaction!(async (tx) => {
            // Keep the original row as history, flagged as rescheduled.
            await this.repository.update(
                sessionId,
                studentProgramId,
                { attendance_status: 'RESCHEDULED', notes: data.reason ?? null },
                tx,
            );

            await this.repository.create(
                {
                    session_id: targetId,
                    student_program_id: studentProgramId,
                    attendance_status: 'ABSENT',
                    notes: data.reason ?? null,
                },
                tx,
            );

            if (this.rescheduleRepository) {
                await this.rescheduleRepository.create(
                    {
                        type: 'STUDENT',
                        class_id: source.class_id,
                        student_program_id: studentProgramId,
                        from_session_id: sessionId,
                        to_session_id: targetId,
                        reason: data.reason ?? null,
                        created_by: data.created_by ?? null,
                    },
                    tx,
                );
            }

            return {
                student_program_id: studentProgramId,
                from_session_id: sessionId,
                to_session_id: targetId,
                target_date: targetDate,
            };
        });
    }

    /**
     * Active members of a class with their package quota usage, used by the
     * frontend to disable students whose session quota is already full.
     */
    async getClassStudentQuotas(classId: number): Promise<any[]> {
        const rows = await this.repository.findClassMembersWithQuota(classId);
        return rows.map((row: any) => {
            const total =
                row.total_sessions !== null && row.total_sessions !== undefined
                    ? Number(row.total_sessions)
                    : null;
            const used = Number(row.used ?? 0);
            const rescheduled = Number(row.rescheduled ?? 0);
            return {
                student_program_id: row.student_program_id,
                student_id: row.student_id,
                student_name: row.student_name,
                branch_id: row.branch_id,
                branch_name: row.branch_name,
                package_name: row.package_name,
                level_name: row.level_name,
                enrollment_status: row.enrollment_status,
                started_at: toDateOnly(row.started_at),
                ended_at: toDateOnly(row.ended_at),
                sessions_per_period: row.sessions_per_period,
                session_period: row.session_period,
                total_sessions: total,
                used,
                rescheduled,
                remaining: total !== null && total > 0 ? Math.max(total - used, 0) : null,
                can_join: total === null || total <= 0 ? true : used < total,
            };
        });
    }
}
