import { HttpError } from '../../core/errors/http.error';
import type { DatabaseClient } from '../../config/database/types';
import type { SessionAttendanceStatus } from '../../shared/class/class.types';
import type { ISessionConflictService } from '../../shared/class/schedule-conflict.service';
import { isDuplicateEntryError } from '../../shared/class/class.util';
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
}
