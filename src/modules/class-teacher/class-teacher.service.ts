import { HttpError } from '../../core/errors/http.error';
import type { ClassTeacherRole } from '../../shared/class/class.types';
import type { IClassRepository } from '../class-management/class.interface';
import { today } from '../../shared/class/class.util';
import type { IClassTeacherRepository, IClassTeacherService } from './class-teacher.interface';

export class ClassTeacherService implements IClassTeacherService {
    constructor(
        private readonly repository: IClassTeacherRepository,
        private readonly classRepository: IClassRepository,
    ) {}

    private async getClassOrFail(classId: number): Promise<any> {
        const found = await this.classRepository.findById(classId);
        if (!found) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }
        return found;
    }

    async getClassTeachers(classId: number): Promise<any> {
        await this.getClassOrFail(classId);
        return await this.repository.findByClass(classId);
    }

    async addClassTeacher(
        classId: number,
        data: {
            teacher_id: number;
            role: ClassTeacherRole;
            started_at: string;
            ended_at?: string | null;
        },
    ): Promise<any> {
        const klass = await this.getClassOrFail(classId);
        const role: ClassTeacherRole = data.role ?? 'PRIMARY';

        const teacherExists = await this.repository.teacherExists(data.teacher_id);
        if (!teacherExists) {
            throw new HttpError(404, 'Teacher not found', 'TEACHER_NOT_FOUND', true);
        }

        const assignedToBranch = await this.repository.isTeacherAssignedToBranch(
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

        if (data.ended_at && data.started_at > data.ended_at) {
            throw new HttpError(
                400,
                'started_at must be before or equal to ended_at',
                'INVALID_DATE_RANGE',
                true,
            );
        }

        if (role === 'PRIMARY') {
            const overlaps = await this.repository.findOverlappingAssignments(
                classId,
                data.started_at,
                data.ended_at ?? null,
                'PRIMARY',
            );
            if (overlaps.length > 0) {
                throw new HttpError(
                    409,
                    'Class already has an active primary teacher for this period',
                    'INVALID_CLASS_TEACHER_ASSIGNMENT',
                    true,
                    overlaps,
                );
            }
        }

        try {
            return await this.repository.create({
                class_id: classId,
                teacher_id: data.teacher_id,
                role,
                started_at: data.started_at,
                ended_at: data.ended_at ?? null,
            });
        } catch (error: any) {
            if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
                throw new HttpError(
                    409,
                    'Teacher already assigned to this class with the same role and start date',
                    'TEACHER_ALREADY_ASSIGNED',
                    true,
                );
            }
            throw error;
        }
    }

    async updateClassTeacher(
        classId: number,
        id: number,
        data: { role?: ClassTeacherRole; started_at?: string; ended_at?: string | null },
    ): Promise<any> {
        await this.getClassOrFail(classId);

        const existing = await this.repository.findById(id);
        if (!existing || Number(existing.class_id) !== Number(classId)) {
            throw new HttpError(
                404,
                'Class teacher assignment not found',
                'INVALID_CLASS_TEACHER_ASSIGNMENT',
                true,
            );
        }

        const role: ClassTeacherRole = data.role ?? existing.role;
        const startedAt = data.started_at ?? existing.started_at;
        const endedAt = data.ended_at !== undefined ? data.ended_at : existing.ended_at;

        if (endedAt && startedAt > endedAt) {
            throw new HttpError(
                400,
                'started_at must be before or equal to ended_at',
                'INVALID_DATE_RANGE',
                true,
            );
        }

        if (role === 'PRIMARY') {
            const overlaps = await this.repository.findOverlappingAssignments(
                classId,
                startedAt,
                endedAt,
                'PRIMARY',
                id,
            );
            if (overlaps.length > 0) {
                throw new HttpError(
                    409,
                    'Class already has an active primary teacher for this period',
                    'INVALID_CLASS_TEACHER_ASSIGNMENT',
                    true,
                    overlaps,
                );
            }
        }

        return await this.repository.update(id, data);
    }

    async removeClassTeacher(classId: number, id: number): Promise<any> {
        await this.getClassOrFail(classId);

        const existing = await this.repository.findById(id);
        if (!existing || Number(existing.class_id) !== Number(classId)) {
            throw new HttpError(
                404,
                'Class teacher assignment not found',
                'INVALID_CLASS_TEACHER_ASSIGNMENT',
                true,
            );
        }

        await this.repository.delete(id);
        return { id };
    }

    async getActivePrimaryTeacher(classId: number, date: string): Promise<any> {
        return await this.repository.findActiveAssignmentOnDate(
            classId,
            date ?? today(),
            'PRIMARY',
        );
    }
}
