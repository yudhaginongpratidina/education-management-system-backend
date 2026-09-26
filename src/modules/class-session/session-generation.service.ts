import { HttpError } from '../../core/errors/http.error';
import type { DatabaseClient } from '../../config/database/types';
import type { ISessionConflictService } from '../../shared/class/schedule-conflict.service';
import type { IClassRepository } from '../class-management/class.interface';
import type { IClassScheduleRepository } from '../class-schedule/class-schedule.interface';
import type { IClassTeacherRepository } from '../class-teacher/class-teacher.interface';
import type { IClassSessionRepository, ISessionGenerationService } from './class-session.interface';

/**
 * Generates real class_sessions from active recurring class_schedules.
 * Idempotent: running it twice for the same range will not duplicate sessions.
 */
export class SessionGenerationService implements ISessionGenerationService {
    constructor(
        private readonly classRepository: IClassRepository,
        private readonly scheduleRepository: IClassScheduleRepository,
        private readonly sessionRepository: IClassSessionRepository,
        private readonly classTeacherRepository: IClassTeacherRepository,
        private readonly conflictService: ISessionConflictService,
        private readonly db: DatabaseClient,
    ) {}

    async generateForClass(
        classId: number,
        from: string,
        to: string,
    ): Promise<{ created: number; skipped: number }> {
        const klass = await this.classRepository.findById(classId);
        if (!klass) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }
        if (from > to) {
            throw new HttpError(
                400,
                '`from` must be before or equal to `to`',
                'INVALID_DATE_RANGE',
                true,
            );
        }
        if (klass.status !== 'ACTIVE') {
            throw new HttpError(409, 'Class is not active', 'CLASS_NOT_ACTIVE', true);
        }

        const schedules = (await this.scheduleRepository.findByClass(classId)).filter(
            (schedule: any) => Boolean(schedule.is_active),
        );

        let created = 0;
        let skipped = 0;

        await this.db.transaction!(async (tx) => {
            const startDate = new Date(`${from}T00:00:00Z`);
            const endDate = new Date(`${to}T00:00:00Z`);

            for (
                let cursor = new Date(startDate);
                cursor <= endDate;
                cursor.setUTCDate(cursor.getUTCDate() + 1)
            ) {
                const date = cursor.toISOString().slice(0, 10);
                // ISO day of week: 1 = Monday ... 7 = Sunday.
                const dayOfWeek = cursor.getUTCDay() === 0 ? 7 : cursor.getUTCDay();

                const matching = schedules.filter(
                    (schedule: any) =>
                        Number(schedule.day_of_week) === dayOfWeek &&
                        String(schedule.effective_from).slice(0, 10) <= date &&
                        (!schedule.effective_until ||
                            String(schedule.effective_until).slice(0, 10) >= date),
                );

                for (const schedule of matching) {
                    const existing = await this.sessionRepository.findExistingSession(
                        classId,
                        date,
                        schedule.start_time,
                        schedule.end_time,
                        tx,
                    );
                    if (existing) {
                        skipped++;
                        continue;
                    }

                    const primaryTeacher =
                        await this.classTeacherRepository.findActiveAssignmentOnDate(
                            classId,
                            date,
                            'PRIMARY',
                            tx,
                        );
                    if (!primaryTeacher) {
                        skipped++;
                        continue;
                    }

                    try {
                        await this.conflictService.checkClassSessionConflict(
                            classId,
                            date,
                            schedule.start_time,
                            schedule.end_time,
                            undefined,
                            tx,
                        );
                        await this.conflictService.checkTeacherSessionConflict(
                            primaryTeacher.teacher_id,
                            date,
                            schedule.start_time,
                            schedule.end_time,
                            undefined,
                            tx,
                        );
                    } catch (error) {
                        if (error instanceof HttpError && error.status === 409) {
                            skipped++;
                            continue;
                        }
                        throw error;
                    }

                    await this.sessionRepository.create(
                        {
                            class_id: classId,
                            scheduled_date: date,
                            start_time: schedule.start_time,
                            end_time: schedule.end_time,
                            teacher_id: primaryTeacher.teacher_id,
                            status: 'SCHEDULED',
                            notes: null,
                        },
                        tx,
                    );
                    created++;
                }
            }
        });

        return { created, skipped };
    }
}
