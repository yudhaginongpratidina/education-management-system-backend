import { HttpError } from '../../core/errors/http.error';
import type { IClassRepository } from '../class-management/class.interface';
import { isDuplicateEntryError, today } from '../../shared/class/class.util';
import type { IClassStudentRepository, IClassStudentService } from './class-student.interface';

export class ClassStudentService implements IClassStudentService {
    constructor(
        private readonly repository: IClassStudentRepository,
        private readonly classRepository: IClassRepository,
    ) {}

    private async getClassOrFail(classId: number): Promise<any> {
        const found = await this.classRepository.findById(classId);
        if (!found) {
            throw new HttpError(404, 'Class not found', 'CLASS_NOT_FOUND', true);
        }
        return found;
    }

    async getClassStudents(classId: number): Promise<any> {
        await this.getClassOrFail(classId);
        return await this.repository.findByClass(classId);
    }

    /**
     * Students that may be added to this class: same branch, matching program
     * (and level), still active, not already a member. Includes quota info.
     */
    async getEligibleStudents(classId: number): Promise<any[]> {
        const klass = await this.getClassOrFail(classId);
        const rows = await this.repository.findEligibleStudents({
            classId,
            branchId: klass.branch_id,
            programId: klass.program_id,
            levelId: klass.program_level_id,
        });
        return rows.map((row) => {
            const total = row.total_sessions != null ? Number(row.total_sessions) : null;
            const used = Number(row.used ?? 0);
            return {
                ...row,
                total_sessions: total,
                used,
                remaining: total !== null && total > 0 ? Math.max(total - used, 0) : null,
                can_join: total === null || total <= 0 ? true : used < total,
            };
        });
    }

    async addClassStudent(
        classId: number,
        data: { student_program_id: number; joined_at?: string },
    ): Promise<any> {
        const klass = await this.getClassOrFail(classId);

        const studentProgram = await this.repository.getStudentProgram(data.student_program_id);
        if (!studentProgram) {
            throw new HttpError(
                404,
                'Student program not found',
                'STUDENT_PROGRAM_NOT_FOUND',
                true,
            );
        }

        if (Number(studentProgram.branch_id) !== Number(klass.branch_id)) {
            throw new HttpError(
                400,
                'Student program branch does not match class branch',
                'STUDENT_BRANCH_MISMATCH',
                true,
            );
        }

        // The class is tied to a program: the enrollment must belong to it.
        if (klass.program_id) {
            const enrollmentProgramId =
                studentProgram.package_program_id ?? studentProgram.level_program_id;
            if (Number(enrollmentProgramId) !== Number(klass.program_id)) {
                throw new HttpError(
                    409,
                    'Program siswa tidak sesuai dengan program kelas',
                    'PROGRAM_MISMATCH',
                    true,
                    {
                        class_program_id: klass.program_id,
                        enrollment_program_id: enrollmentProgramId ?? null,
                    },
                );
            }
        }
        if (
            klass.program_level_id &&
            Number(studentProgram.program_level_id) !== Number(klass.program_level_id)
        ) {
            throw new HttpError(
                409,
                'Level siswa tidak sesuai dengan level kelas',
                'LEVEL_MISMATCH',
                true,
                {
                    class_level_id: klass.program_level_id,
                    enrollment_level_id: studentProgram.program_level_id ?? null,
                },
            );
        }

        const joinedAt = data.joined_at ?? today();
        const existing = await this.repository.findMembership(classId, data.student_program_id);

        if (existing) {
            if (existing.left_at === null) {
                throw new HttpError(
                    409,
                    'Student is already an active member of this class',
                    'STUDENT_ALREADY_IN_CLASS',
                    true,
                );
            }
            // Re-activate a historical membership.
            return await this.repository.update(classId, data.student_program_id, {
                joined_at: joinedAt,
                left_at: null,
            });
        }

        try {
            await this.repository.create({
                class_id: classId,
                student_program_id: data.student_program_id,
                joined_at: joinedAt,
            });
        } catch (error) {
            if (isDuplicateEntryError(error)) {
                throw new HttpError(
                    409,
                    'Student is already a member of this class',
                    'STUDENT_ALREADY_IN_CLASS',
                    true,
                );
            }
            throw error;
        }

        return await this.repository.findMembership(classId, data.student_program_id);
    }

    async updateClassStudent(
        classId: number,
        studentProgramId: number,
        data: { joined_at?: string; left_at?: string | null },
    ): Promise<any> {
        await this.getClassOrFail(classId);

        const existing = await this.repository.findMembership(classId, studentProgramId);
        if (!existing) {
            throw new HttpError(
                404,
                'Student is not a member of this class',
                'STUDENT_NOT_IN_CLASS',
                true,
            );
        }

        return await this.repository.update(classId, studentProgramId, data);
    }

    async removeClassStudent(classId: number, studentProgramId: number): Promise<any> {
        await this.getClassOrFail(classId);

        const existing = await this.repository.findMembership(classId, studentProgramId);
        if (!existing) {
            throw new HttpError(
                404,
                'Student is not a member of this class',
                'STUDENT_NOT_IN_CLASS',
                true,
            );
        }

        // Keep historical membership tracking by populating left_at.
        return await this.repository.update(classId, studentProgramId, { left_at: today() });
    }
}
