import { HttpError } from '../../core/errors/http.error';
import type { IScheduleConflictService } from '../../shared/class/schedule-conflict.service';
import type { IClassRepository } from '../class-management/class.interface';
import { normalizeTime } from '../../shared/class/class.util';
import type { IClassScheduleRepository, IClassScheduleService } from './class-schedule.interface';

export class ClassScheduleService implements IClassScheduleService {
    constructor(
        private readonly repository: IClassScheduleRepository,
        private readonly classRepository: IClassRepository,
        private readonly conflictService: IScheduleConflictService,
    ) {}

    private async getClassOrFail(classId: number): Promise<any> {
        const found = await this.classRepository.findById(classId);
        if (!found) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }
        return found;
    }

    async getClassSchedules(classId: number): Promise<any> {
        await this.getClassOrFail(classId);
        return await this.repository.findByClass(classId);
    }

    async addClassSchedule(classId: number, data: any): Promise<any> {
        await this.getClassOrFail(classId);

        const startTime = normalizeTime(data.start_time) as string;
        const endTime = normalizeTime(data.end_time) as string;
        const effectiveUntil = data.effective_until ?? null;

        if (endTime <= startTime) {
            throw new HttpError(
                400,
                'end_time must be greater than start_time',
                'INVALID_TIME_RANGE',
                true,
            );
        }
        if (effectiveUntil && data.effective_from > effectiveUntil) {
            throw new HttpError(
                400,
                'effective_from must be before or equal to effective_until',
                'INVALID_DATE_RANGE',
                true,
            );
        }

        await this.conflictService.checkClassScheduleConflict(
            classId,
            data.day_of_week,
            startTime,
            endTime,
            data.effective_from,
            effectiveUntil,
        );

        return await this.repository.create({
            class_id: classId,
            day_of_week: data.day_of_week,
            start_time: startTime,
            end_time: endTime,
            effective_from: data.effective_from,
            effective_until: effectiveUntil,
            is_active: data.is_active ?? true,
        });
    }

    async updateClassSchedule(classId: number, id: number, data: any): Promise<any> {
        await this.getClassOrFail(classId);

        const existing = await this.repository.findById(id);
        if (!existing || Number(existing.class_id) !== Number(classId)) {
            throw new HttpError(404, 'Class schedule not found', 'CLASS_SCHEDULE_NOT_FOUND', true);
        }

        const dayOfWeek = data.day_of_week ?? existing.day_of_week;
        const startTime = normalizeTime(data.start_time ?? existing.start_time) as string;
        const endTime = normalizeTime(data.end_time ?? existing.end_time) as string;
        const effectiveFrom = data.effective_from ?? existing.effective_from;
        const effectiveUntil =
            data.effective_until !== undefined ? data.effective_until : existing.effective_until;
        const isActive = data.is_active ?? Boolean(existing.is_active);

        if (endTime <= startTime) {
            throw new HttpError(
                400,
                'end_time must be greater than start_time',
                'INVALID_TIME_RANGE',
                true,
            );
        }
        if (effectiveUntil && effectiveFrom > effectiveUntil) {
            throw new HttpError(
                400,
                'effective_from must be before or equal to effective_until',
                'INVALID_DATE_RANGE',
                true,
            );
        }

        if (isActive) {
            await this.conflictService.checkClassScheduleConflict(
                classId,
                dayOfWeek,
                startTime,
                endTime,
                effectiveFrom,
                effectiveUntil,
                id,
            );
        }

        return await this.repository.update(id, {
            ...data,
            start_time: startTime,
            end_time: endTime,
            effective_until: effectiveUntil,
        });
    }

    async removeClassSchedule(classId: number, id: number): Promise<any> {
        await this.getClassOrFail(classId);

        const existing = await this.repository.findById(id);
        if (!existing || Number(existing.class_id) !== Number(classId)) {
            throw new HttpError(404, 'Class schedule not found', 'CLASS_SCHEDULE_NOT_FOUND', true);
        }

        await this.repository.delete(id);
        return { id };
    }
}
