import { HttpError } from '../../core/errors/http.error';
import type { DatabaseClient } from '../../config/database/types';
import type { ClassSessionStatus, Pagination, QueryExecutor } from '../../shared/class/class.types';
import type { ISessionConflictService } from '../../shared/class/schedule-conflict.service';
import type { IClassRepository } from '../class-management/class.interface';
import type { IClassTeacherRepository } from '../class-teacher/class-teacher.interface';
import { isDuplicateEntryError, normalizeTime, toDateOnly } from '../../shared/class/class.util';
import {
    assertQuotaAvailable,
    assertWithinEnrollmentWindow,
} from '../../shared/class/enrollment-quota.util';
import type { ISessionRescheduleRepository } from '../session-reschedule/session-reschedule.interface';
import type {
    IClassSessionRepository,
    IClassSessionService,
    IClassSessionStudentRepository,
    SessionListFilter,
} from './class-session.interface';

const ALLOWED_TRANSITIONS: Record<ClassSessionStatus, ClassSessionStatus[]> = {
    SCHEDULED: ['ONGOING', 'CANCELLED', 'RESCHEDULED'],
    ONGOING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    RESCHEDULED: [],
};

export class ClassSessionService implements IClassSessionService {
    constructor(
        private readonly repository: IClassSessionRepository,
        private readonly classRepository: IClassRepository,
        private readonly classTeacherRepository: IClassTeacherRepository,
        private readonly sessionStudentRepository: IClassSessionStudentRepository,
        private readonly conflictService: ISessionConflictService,
        private readonly db: DatabaseClient,
        private readonly rescheduleRepository?: ISessionRescheduleRepository,
    ) {}

    private async getClassOrFail(classId: number): Promise<any> {
        const found = await this.classRepository.findById(classId);
        if (!found) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }
        return found;
    }

    private async getSessionOrFail(id: number): Promise<any> {
        const found = await this.repository.findById(id);
        if (!found) {
            throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND', true);
        }
        return found;
    }

    /**
     * A session teacher must exist, be assigned to the class (class_teachers) and
     * the assignment must be active on the session date, and belong to the class branch.
     */
    private async validateTeacherEligibility(
        classId: number,
        branchId: number,
        teacherId: number,
        date: string,
        executor?: QueryExecutor,
    ): Promise<void> {
        const teacherExists = await this.classTeacherRepository.teacherExists(teacherId);
        if (!teacherExists) {
            throw new HttpError(404, 'Teacher not found', 'TEACHER_NOT_FOUND', true);
        }

        const assignments = await this.classTeacherRepository.findActiveAssignmentsForTeacher(
            classId,
            teacherId,
            date,
            executor,
        );
        if (assignments.length === 0) {
            throw new HttpError(
                400,
                'Teacher is not assigned to this class for the session date',
                'INVALID_CLASS_TEACHER_ASSIGNMENT',
                true,
            );
        }

        const assignedToBranch = await this.classTeacherRepository.isTeacherAssignedToBranch(
            teacherId,
            branchId,
        );
        if (!assignedToBranch) {
            throw new HttpError(
                400,
                'Teacher is not assigned to the class branch',
                'TEACHER_BRANCH_MISMATCH',
                true,
            );
        }
    }

    private async addParticipant(
        classId: number,
        branchId: number,
        session: any,
        studentProgramId: number,
        attendanceStatus: string | undefined,
        notes: string | null | undefined,
        executor?: QueryExecutor,
    ): Promise<void> {
        const studentProgram =
            await this.sessionStudentRepository.getStudentProgram(studentProgramId);
        if (!studentProgram) {
            throw new HttpError(
                404,
                'Student program not found',
                'STUDENT_PROGRAM_NOT_FOUND',
                true,
            );
        }

        if (Number(studentProgram.branch_id) !== Number(branchId)) {
            throw new HttpError(
                400,
                'Student program branch does not match class branch',
                'STUDENT_BRANCH_MISMATCH',
                true,
            );
        }

        const isMember = await this.sessionStudentRepository.isMemberOfClass(
            classId,
            studentProgramId,
        );
        if (!isMember) {
            throw new HttpError(
                400,
                'Student is not an active member of this class',
                'STUDENT_NOT_IN_CLASS',
                true,
            );
        }

        // Package-driven eligibility: inside the enrollment period and within
        // the session quota (RESCHEDULED rows do not count).
        assertWithinEnrollmentWindow(studentProgram, toDateOnly(session.scheduled_date) as string);
        const quotaUsage = await this.sessionStudentRepository.getQuotaUsage(studentProgramId);
        assertQuotaAvailable(studentProgram, quotaUsage);

        await this.conflictService.checkStudentSessionConflict(
            studentProgramId,
            session.scheduled_date,
            session.start_time,
            session.end_time,
            session.id,
            executor,
        );

        try {
            await this.sessionStudentRepository.create(
                {
                    session_id: session.id,
                    student_program_id: studentProgramId,
                    attendance_status: (attendanceStatus as any) ?? 'ABSENT',
                    notes: notes ?? null,
                },
                executor,
            );
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
    }

    async getClassSessions(classId: number, filter: SessionListFilter): Promise<any> {
        await this.getClassOrFail(classId);
        return await this.repository.findAll({ ...filter, class_id: classId });
    }

    async getSessions(filter: SessionListFilter, pagination?: Pagination): Promise<any> {
        return await this.repository.findAll(filter, pagination);
    }

    async getSessionById(id: number): Promise<any> {
        const session = await this.getSessionOrFail(id);
        const participants = await this.sessionStudentRepository.findBySession(id);
        return { ...session, participants };
    }

    async createClassSession(classId: number, data: any): Promise<any> {
        const klass = await this.getClassOrFail(classId);
        if (klass.status !== 'ACTIVE') {
            throw new HttpError(409, 'Class is not active', 'CLASS_NOT_ACTIVE', true);
        }

        const startTime = normalizeTime(data.start_time) as string;
        const endTime = normalizeTime(data.end_time) as string;
        if (endTime <= startTime) {
            throw new HttpError(
                400,
                'end_time must be greater than start_time',
                'INVALID_TIME_RANGE',
                true,
            );
        }

        return await this.db.transaction!(async (tx) => {
            await this.validateTeacherEligibility(
                classId,
                klass.branch_id,
                data.teacher_id,
                data.scheduled_date,
                tx,
            );
            await this.conflictService.checkClassSessionConflict(
                classId,
                data.scheduled_date,
                startTime,
                endTime,
                undefined,
                tx,
            );
            await this.conflictService.checkTeacherSessionConflict(
                data.teacher_id,
                data.scheduled_date,
                startTime,
                endTime,
                undefined,
                tx,
            );

            const session = await this.repository.create(
                {
                    class_id: classId,
                    scheduled_date: data.scheduled_date,
                    start_time: startTime,
                    end_time: endTime,
                    teacher_id: data.teacher_id,
                    status: data.status ?? 'SCHEDULED',
                    notes: data.notes ?? null,
                },
                tx,
            );

            const studentProgramIds: number[] = data.student_program_ids ?? [];
            for (const studentProgramId of studentProgramIds) {
                await this.addParticipant(
                    classId,
                    klass.branch_id,
                    session,
                    studentProgramId,
                    'ABSENT',
                    null,
                    tx,
                );
            }

            return session;
        });
    }

    /**
     * Validate a participant for the bulk flow WITHOUT writing anything, so a
     * whole (date x time-slot) candidate can be rejected before any insert.
     */
    private async validateBulkParticipant(
        classId: number,
        branchId: number,
        studentProgramId: number,
        date: string,
        startTime: string,
        endTime: string,
        executor?: QueryExecutor,
    ): Promise<void> {
        const studentProgram =
            await this.sessionStudentRepository.getStudentProgram(studentProgramId);
        if (!studentProgram) {
            throw new HttpError(
                404,
                'Student program not found',
                'STUDENT_PROGRAM_NOT_FOUND',
                true,
            );
        }

        if (Number(studentProgram.branch_id) !== Number(branchId)) {
            throw new HttpError(
                400,
                'Student program branch does not match class branch',
                'STUDENT_BRANCH_MISMATCH',
                true,
            );
        }

        const isMember = await this.sessionStudentRepository.isMemberOfClass(
            classId,
            studentProgramId,
        );
        if (!isMember) {
            throw new HttpError(
                400,
                'Student is not an active member of this class',
                'STUDENT_NOT_IN_CLASS',
                true,
            );
        }

        assertWithinEnrollmentWindow(studentProgram, date);
        const quotaUsage = await this.sessionStudentRepository.getQuotaUsage(studentProgramId);
        assertQuotaAvailable(studentProgram, quotaUsage);

        await this.conflictService.checkStudentSessionConflict(
            studentProgramId,
            date,
            startTime,
            endTime,
            undefined,
            executor,
        );
    }

    /**
     * Create many sessions at once from the cartesian product of `dates` and
     * `time_slots`. Every candidate is conflict-checked (class, teacher and each
     * student) before it is inserted.
     *
     * With `skip_conflicts` (default true) conflicting candidates are reported in
     * `skipped` and the rest are still created. When false, the first conflict
     * aborts the whole batch.
     */
    async bulkCreateSessions(classId: number, data: any): Promise<any> {
        const klass = await this.getClassOrFail(classId);
        if (klass.status !== 'ACTIVE') {
            throw new HttpError(409, 'Class is not active', 'CLASS_NOT_ACTIVE', true);
        }

        const dates = [...new Set<string>(data.dates)].sort();
        const slots = (data.time_slots as any[]).map((slot) => ({
            start_time: normalizeTime(slot.start_time) as string,
            end_time: normalizeTime(slot.end_time) as string,
        }));
        const studentProgramIds = [...new Set<number>(data.student_program_ids ?? [])];
        const status: ClassSessionStatus = data.status ?? 'SCHEDULED';
        const skipConflicts = data.skip_conflicts !== false;

        if (dates.length * slots.length > 200) {
            throw new HttpError(
                400,
                'Too many sessions requested at once (maximum 200)',
                'TOO_MANY_SESSIONS',
                true,
            );
        }

        const created: any[] = [];
        const skipped: any[] = [];

        await this.db.transaction!(async (tx) => {
            for (const date of dates) {
                for (const slot of slots) {
                    try {
                        await this.validateTeacherEligibility(
                            classId,
                            klass.branch_id,
                            data.teacher_id,
                            date,
                            tx,
                        );
                        await this.conflictService.checkClassSessionConflict(
                            classId,
                            date,
                            slot.start_time,
                            slot.end_time,
                            undefined,
                            tx,
                        );
                        await this.conflictService.checkTeacherSessionConflict(
                            data.teacher_id,
                            date,
                            slot.start_time,
                            slot.end_time,
                            undefined,
                            tx,
                        );

                        for (const studentProgramId of studentProgramIds) {
                            await this.validateBulkParticipant(
                                classId,
                                klass.branch_id,
                                studentProgramId,
                                date,
                                slot.start_time,
                                slot.end_time,
                                tx,
                            );
                        }
                    } catch (error) {
                        if (
                            skipConflicts &&
                            error instanceof HttpError &&
                            [400, 404, 409].includes(error.status)
                        ) {
                            skipped.push({
                                scheduled_date: date,
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                code: error.code,
                                reason: error.message,
                            });
                            continue;
                        }
                        throw error;
                    }

                    const session = await this.repository.create(
                        {
                            class_id: classId,
                            scheduled_date: date,
                            start_time: slot.start_time,
                            end_time: slot.end_time,
                            teacher_id: data.teacher_id,
                            status,
                            notes: data.notes ?? null,
                        },
                        tx,
                    );

                    for (const studentProgramId of studentProgramIds) {
                        await this.sessionStudentRepository.create(
                            {
                                session_id: session.id,
                                student_program_id: studentProgramId,
                                attendance_status: 'ABSENT',
                                notes: null,
                            },
                            tx,
                        );
                    }

                    created.push({
                        ...session,
                        participant_count: studentProgramIds.length,
                    });
                }
            }
        });

        return {
            total_requested: dates.length * slots.length,
            created_count: created.length,
            skipped_count: skipped.length,
            created,
            skipped,
        };
    }

    async updateSession(id: number, data: any): Promise<any> {
        const existing = await this.getSessionOrFail(id);
        const klass = await this.getClassOrFail(existing.class_id);

        const scheduledDate = data.scheduled_date ?? existing.scheduled_date;
        const startTime = normalizeTime(data.start_time ?? existing.start_time) as string;
        const endTime = normalizeTime(data.end_time ?? existing.end_time) as string;
        const teacherId = data.teacher_id ?? existing.teacher_id;

        if (endTime <= startTime) {
            throw new HttpError(
                400,
                'end_time must be greater than start_time',
                'INVALID_TIME_RANGE',
                true,
            );
        }

        if (data.status !== undefined && data.status !== existing.status) {
            const allowed = ALLOWED_TRANSITIONS[existing.status as ClassSessionStatus] ?? [];
            if (!allowed.includes(data.status)) {
                throw new HttpError(
                    409,
                    `Cannot change session status from ${existing.status} to ${data.status}`,
                    'INVALID_SESSION_STATUS_TRANSITION',
                    true,
                );
            }
        }

        const scheduleChanged =
            scheduledDate !== existing.scheduled_date ||
            startTime !== existing.start_time ||
            endTime !== existing.end_time ||
            teacherId !== existing.teacher_id;

        const timeChanged = startTime !== existing.start_time || endTime !== existing.end_time;
        const teacherChanged = teacherId !== existing.teacher_id;

        return await this.db.transaction!(async (tx) => {
            if (scheduleChanged) {
                if (teacherChanged || timeChanged || scheduledDate !== existing.scheduled_date) {
                    await this.validateTeacherEligibility(
                        existing.class_id,
                        klass.branch_id,
                        teacherId,
                        scheduledDate,
                        tx,
                    );
                }
                await this.conflictService.checkClassSessionConflict(
                    existing.class_id,
                    scheduledDate,
                    startTime,
                    endTime,
                    id,
                    tx,
                );
                await this.conflictService.checkTeacherSessionConflict(
                    teacherId,
                    scheduledDate,
                    startTime,
                    endTime,
                    id,
                    tx,
                );
            }

            return await this.repository.update(
                id,
                {
                    ...data,
                    scheduled_date: scheduledDate,
                    start_time: startTime,
                    end_time: endTime,
                    teacher_id: teacherId,
                },
                tx,
            );
        });
    }

    async deleteSession(id: number): Promise<void> {
        await this.getSessionOrFail(id);
        await this.repository.delete(id);
    }

    async rescheduleSession(id: number, data: any): Promise<any> {
        const existing = await this.getSessionOrFail(id);
        if (existing.status !== 'SCHEDULED') {
            throw new HttpError(
                409,
                'Only SCHEDULED sessions can be rescheduled',
                'INVALID_SESSION_STATUS_TRANSITION',
                true,
            );
        }

        const klass = await this.getClassOrFail(existing.class_id);
        const startTime = normalizeTime(data.start_time) as string;
        const endTime = normalizeTime(data.end_time) as string;
        if (endTime <= startTime) {
            throw new HttpError(
                400,
                'end_time must be greater than start_time',
                'INVALID_TIME_RANGE',
                true,
            );
        }

        return await this.db.transaction!(async (tx) => {
            await this.validateTeacherEligibility(
                existing.class_id,
                klass.branch_id,
                data.teacher_id,
                data.scheduled_date,
                tx,
            );
            await this.conflictService.checkClassSessionConflict(
                existing.class_id,
                data.scheduled_date,
                startTime,
                endTime,
                id,
                tx,
            );
            await this.conflictService.checkTeacherSessionConflict(
                data.teacher_id,
                data.scheduled_date,
                startTime,
                endTime,
                id,
                tx,
            );

            const participants = await this.sessionStudentRepository.findBySession(id);

            // The new date must still fall inside each student's enrollment period
            // (package-driven). `force: true` lets an admin override intentionally.
            const outsideWindow: any[] = [];
            for (const participant of participants) {
                const enrollment = await this.sessionStudentRepository.getStudentProgram(
                    participant.student_program_id,
                );
                const startedAt = toDateOnly(enrollment?.started_at);
                const endedAt = toDateOnly(enrollment?.ended_at);
                if (
                    (startedAt && data.scheduled_date < startedAt) ||
                    (endedAt && data.scheduled_date > endedAt)
                ) {
                    outsideWindow.push({
                        student_program_id: participant.student_program_id,
                        student_name: participant.student_name,
                        started_at: startedAt,
                        ended_at: endedAt,
                    });
                }
            }

            if (outsideWindow.length > 0 && !data.force) {
                throw new HttpError(
                    409,
                    'New date is outside some students enrollment period',
                    'ENROLLMENT_WINDOW_EXCEEDED',
                    true,
                    outsideWindow,
                );
            }

            for (const participant of participants) {
                await this.conflictService.checkStudentSessionConflict(
                    participant.student_program_id,
                    data.scheduled_date,
                    startTime,
                    endTime,
                    id,
                    tx,
                );
            }

            // The original session becomes history, a new SCHEDULED session takes over.
            await this.repository.update(
                id,
                { status: 'RESCHEDULED', notes: data.notes ?? existing.notes },
                tx,
            );

            const created = await this.repository.create(
                {
                    class_id: existing.class_id,
                    scheduled_date: data.scheduled_date,
                    start_time: startTime,
                    end_time: endTime,
                    teacher_id: data.teacher_id,
                    status: 'SCHEDULED',
                    notes: data.notes ?? null,
                },
                tx,
            );

            for (const participant of participants) {
                await this.sessionStudentRepository.create(
                    {
                        session_id: created.id,
                        student_program_id: participant.student_program_id,
                        attendance_status: 'ABSENT',
                        notes: null,
                    },
                    tx,
                );
            }

            if (this.rescheduleRepository) {
                await this.rescheduleRepository.create(
                    {
                        type: 'SESSION',
                        class_id: existing.class_id,
                        from_session_id: id,
                        to_session_id: created.id,
                        reason: data.notes ?? null,
                        created_by: data.created_by ?? null,
                    },
                    tx,
                );
            }

            return created;
        });
    }

    async substituteTeacher(
        id: number,
        data: { teacher_id: number; notes?: string | null },
    ): Promise<any> {
        const existing = await this.getSessionOrFail(id);
        if (['COMPLETED', 'CANCELLED', 'RESCHEDULED'].includes(existing.status)) {
            throw new HttpError(
                409,
                'Session can no longer accept a substitute teacher',
                'INVALID_SESSION_STATUS_TRANSITION',
                true,
            );
        }

        const klass = await this.getClassOrFail(existing.class_id);

        return await this.db.transaction!(async (tx) => {
            const teacherExists = await this.classTeacherRepository.teacherExists(data.teacher_id);
            if (!teacherExists) {
                throw new HttpError(404, 'Teacher not found', 'TEACHER_NOT_FOUND', true);
            }

            const assignments = await this.classTeacherRepository.findActiveAssignmentsForTeacher(
                klass.id,
                data.teacher_id,
                existing.scheduled_date,
                tx,
            );
            const isSubstitute = assignments.some(
                (assignment: any) => assignment.role === 'SUBSTITUTE',
            );
            if (!isSubstitute) {
                throw new HttpError(
                    400,
                    'Teacher is not an allowed substitute for this class',
                    'TEACHER_NOT_ALLOWED_AS_SUBSTITUTE',
                    true,
                );
            }

            const assignedToBranch = await this.classTeacherRepository.isTeacherAssignedToBranch(
                data.teacher_id,
                klass.branch_id,
            );
            if (!assignedToBranch) {
                throw new HttpError(
                    400,
                    'Teacher is not assigned to the class branch',
                    'TEACHER_BRANCH_MISMATCH',
                    true,
                );
            }

            await this.conflictService.checkTeacherSessionConflict(
                data.teacher_id,
                existing.scheduled_date,
                existing.start_time,
                existing.end_time,
                id,
                tx,
            );

            const updated = await this.repository.update(
                id,
                { teacher_id: data.teacher_id, notes: data.notes ?? existing.notes },
                tx,
            );

            if (this.rescheduleRepository) {
                await this.rescheduleRepository.create(
                    {
                        type: 'TEACHER',
                        class_id: klass.id,
                        from_session_id: id,
                        from_teacher_id: existing.teacher_id,
                        to_teacher_id: data.teacher_id,
                        reason: data.notes ?? null,
                        created_by: (data as any).created_by ?? null,
                    },
                    tx,
                );
            }

            return updated;
        });
    }

    async getCalendar(filter: SessionListFilter): Promise<any> {
        const rows = await this.repository.findCalendar(filter);
        return rows.map((row: any) => ({
            id: row.id,
            title: row.title,
            start: `${String(row.scheduled_date).slice(0, 10)}T${row.start_time}`,
            end: `${String(row.scheduled_date).slice(0, 10)}T${row.end_time}`,
            class_id: row.class_id,
            teacher_id: row.teacher_id,
            branch_id: row.branch_id,
            status: row.status,
        }));
    }
}
