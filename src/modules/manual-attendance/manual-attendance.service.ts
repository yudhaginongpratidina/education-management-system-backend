import { HttpError } from '../../core/errors/http.error';
import type {
    IManualAttendanceInput,
    IManualAttendanceFilter,
    IManualAttendanceRecord,
    IManualAttendanceRepository,
    IManualAttendanceService,
} from './manual-attendance.interface';
import { TeacherRepository } from '../teacher/teacher.repository';
import { BranchRepository } from '../branch-management/branch.repository';

export class ManualAttendanceService implements IManualAttendanceService {
    constructor(
        private readonly repository: IManualAttendanceRepository,
        private readonly teacherRepo: TeacherRepository,
        private readonly branchRepo: BranchRepository,
    ) {}

    async record(
        data: IManualAttendanceInput,
        adminUserId?: number | null,
    ): Promise<IManualAttendanceRecord> {
        // Validate teacher existence
        const teacher = await this.teacherRepo.get_teacher({ id: data.teacher_id });
        if (!teacher || teacher.length === 0) {
            throw new HttpError(404, 'Data guru tidak ditemukan', 'TEACHER_NOT_FOUND', true);
        }

        // Validate branch existence
        const branch = await this.branchRepo.get_branch({ id: data.branch_id });
        if (!branch || branch.length === 0) {
            throw new HttpError(404, 'Data cabang tidak ditemukan', 'BRANCH_NOT_FOUND', true);
        }

        // Prefix notes with manual info if not already there
        const adminTag = adminUserId
            ? `[Manual by SuperAdmin #${adminUserId}]`
            : '[Manual by SuperAdmin]';
        const finalNotes = data.notes
            ? data.notes.includes('Manual by SuperAdmin')
                ? data.notes
                : `${adminTag} ${data.notes}`
            : `${adminTag} Presensi dicatat manual`;

        const payload: IManualAttendanceInput = {
            ...data,
            notes: finalNotes.slice(0, 255),
            is_approved: data.is_approved ?? true,
        };

        return await this.repository.record(payload);
    }

    async get(filter: IManualAttendanceFilter): Promise<IManualAttendanceRecord[]> {
        return await this.repository.get(filter);
    }

    async getById(id: number): Promise<IManualAttendanceRecord> {
        const record = await this.repository.getById(id);
        if (!record) {
            throw new HttpError(404, 'Data presensi tidak ditemukan', 'ATTENDANCE_NOT_FOUND', true);
        }
        return record;
    }

    async update(
        id: number,
        data: Partial<IManualAttendanceInput>,
        adminUserId?: number | null,
    ): Promise<IManualAttendanceRecord> {
        await this.getById(id);

        if (data.teacher_id) {
            const teacher = await this.teacherRepo.get_teacher({ id: data.teacher_id });
            if (!teacher || teacher.length === 0) {
                throw new HttpError(404, 'Data guru tidak ditemukan', 'TEACHER_NOT_FOUND', true);
            }
        }

        if (data.branch_id) {
            const branch = await this.branchRepo.get_branch({ id: data.branch_id });
            if (!branch || branch.length === 0) {
                throw new HttpError(404, 'Data cabang tidak ditemukan', 'BRANCH_NOT_FOUND', true);
            }
        }

        let finalNotes = data.notes;
        if (data.notes !== undefined && data.notes !== null) {
            const adminTag = adminUserId
                ? `[Updated by SuperAdmin #${adminUserId}]`
                : '[Updated by SuperAdmin]';
            finalNotes = data.notes.includes('SuperAdmin')
                ? data.notes
                : `${adminTag} ${data.notes}`;
            finalNotes = finalNotes.slice(0, 255);
        }

        return await this.repository.update(id, {
            ...data,
            notes: finalNotes,
        });
    }

    async delete(id: number): Promise<void> {
        await this.getById(id);
        await this.repository.delete(id);
    }
}
