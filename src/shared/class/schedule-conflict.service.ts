import { HttpError } from '../../core/errors/http.error';
import type { QueryExecutor } from './class.types';

/**
 * Single home for all interval-overlap conflict detection.
 * Every check uses: existing_start < new_end AND existing_end > new_start.
 *
 * The repositories are described structurally so this shared service does not
 * depend on any specific class domain module.
 */
export interface SessionConflictRepository {
    findClassConflicts(
        classId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
    findTeacherConflicts(
        teacherId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
}

export interface SessionStudentConflictRepository {
    findStudentConflicts(
        studentProgramId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
}

export interface ScheduleConflictRepository {
    findConflicts(
        classId: number,
        dayOfWeek: number,
        startTime: string,
        endTime: string,
        effectiveFrom: string,
        effectiveUntil: string | null,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
}

export interface ISessionConflictService {
    checkClassSessionConflict(
        classId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<void>;
    checkTeacherSessionConflict(
        teacherId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<void>;
    checkStudentSessionConflict(
        studentProgramId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<void>;
}

export interface IScheduleConflictService {
    checkClassScheduleConflict(
        classId: number,
        dayOfWeek: number,
        startTime: string,
        endTime: string,
        effectiveFrom: string,
        effectiveUntil: string | null,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<void>;
}

export class SessionConflictService implements ISessionConflictService {
    constructor(
        private readonly sessionRepository: SessionConflictRepository,
        private readonly sessionStudentRepository: SessionStudentConflictRepository,
    ) {}

    async checkClassSessionConflict(
        classId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<void> {
        const conflicts = await this.sessionRepository.findClassConflicts(
            classId,
            date,
            startTime,
            endTime,
            excludeSessionId,
            executor,
        );
        if (conflicts.length > 0) {
            throw new HttpError(
                409,
                'Class already has another session in this time range',
                'CLASS_SCHEDULE_CONFLICT',
                true,
                conflicts,
            );
        }
    }

    async checkTeacherSessionConflict(
        teacherId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<void> {
        const conflicts = await this.sessionRepository.findTeacherConflicts(
            teacherId,
            date,
            startTime,
            endTime,
            excludeSessionId,
            executor,
        );
        if (conflicts.length > 0) {
            throw new HttpError(
                409,
                'Teacher already has another session in this time range',
                'TEACHER_SCHEDULE_CONFLICT',
                true,
                conflicts,
            );
        }
    }

    async checkStudentSessionConflict(
        studentProgramId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<void> {
        const conflicts = await this.sessionStudentRepository.findStudentConflicts(
            studentProgramId,
            date,
            startTime,
            endTime,
            excludeSessionId,
            executor,
        );
        if (conflicts.length > 0) {
            throw new HttpError(
                409,
                'Student already has another session in this time range',
                'STUDENT_SCHEDULE_CONFLICT',
                true,
                conflicts,
            );
        }
    }
}

export class ScheduleConflictService implements IScheduleConflictService {
    constructor(private readonly scheduleRepository: ScheduleConflictRepository) {}

    async checkClassScheduleConflict(
        classId: number,
        dayOfWeek: number,
        startTime: string,
        endTime: string,
        effectiveFrom: string,
        effectiveUntil: string | null,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<void> {
        const conflicts = await this.scheduleRepository.findConflicts(
            classId,
            dayOfWeek,
            startTime,
            endTime,
            effectiveFrom,
            effectiveUntil,
            excludeId,
            executor,
        );
        if (conflicts.length > 0) {
            throw new HttpError(
                409,
                'Class already has an overlapping schedule for this day',
                'CLASS_SCHEDULE_CONFLICT',
                true,
                conflicts,
            );
        }
    }
}
