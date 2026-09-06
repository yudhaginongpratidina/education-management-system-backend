import { HttpError } from '../../core/errors/http.error';
import type {
    ITeacherAttendanceRepository,
    ITeacherAttendanceService,
} from './teacher_attandance.interface';
import { TeacherRepository } from '../teacher/teacher.repository';

export class TeacherAttendanceService implements ITeacherAttendanceService {
    constructor(
        private repo: ITeacherAttendanceRepository,
        private teacherRepo: TeacherRepository,
        private container: any,
    ) {}

    async create_attendance(data: {
        teacher_id: number;
        status:
            | 'PRESENT'
            | 'ABSENT'
            | 'SICK'
            | 'LEAVE'
            | 'REMOTE'
            | 'OFFICIAL_DUTY'
            | 'HOLIDAY'
            | 'LATE';
        attendance_date: string;
        check_in_at?: string | null;
        check_in_photo?: string | null;
        check_out_at?: string | null;
        check_out_photo?: string | null;
        check_in_latitude?: number | null;
        check_in_longitude?: number | null;
        check_out_latitude?: number | null;
        check_out_longitude?: number | null;
        notes?: string | null;
    }): Promise<any> {
        const teacher = await this.teacherRepo.get_teacher({ id: data.teacher_id });
        if (!teacher || teacher.length === 0) {
            throw new HttpError(404, 'Teacher not found', 'TEACHER_NOT_FOUND', true);
        }

        const existingAttendance = await this.repo.get_attendance({
            teacher_id: data.teacher_id,
            attendance_date: data.attendance_date,
        });

        if (existingAttendance.length > 0) {
            throw new HttpError(
                400,
                'Attendance already recorded for this teacher on this date',
                'ATTENDANCE_ALREADY_EXISTS',
                true,
            );
        }

        return await this.repo.create_attendance(data);
    }

    async update_attendance(data: {
        id: number;
        teacher_id: number;
        status:
            | 'PRESENT'
            | 'ABSENT'
            | 'SICK'
            | 'LEAVE'
            | 'REMOTE'
            | 'OFFICIAL_DUTY'
            | 'HOLIDAY'
            | 'LATE';
        attendance_date: string;
        check_in_at?: string | null;
        check_in_photo?: string | null;
        check_out_at?: string | null;
        check_out_photo?: string | null;
        check_in_latitude?: number | null;
        check_in_longitude?: number | null;
        check_out_latitude?: number | null;
        check_out_longitude?: number | null;
        notes?: string | null;
    }): Promise<any> {
        const existingAttendance = await this.repo.get_attendance({ id: data.id });

        if (existingAttendance.length === 0) {
            throw new HttpError(404, 'Attendance not found', 'ATTENDANCE_NOT_FOUND', true);
        }

        return await this.repo.update_attendance(data);
    }

    async get_attendance(filter: {
        id?: number;
        teacher_id?: number;
        status?:
            | 'PRESENT'
            | 'ABSENT'
            | 'SICK'
            | 'LEAVE'
            | 'REMOTE'
            | 'OFFICIAL_DUTY'
            | 'HOLIDAY'
            | 'LATE';
        attendance_date?: string;
    }): Promise<any> {
        const result = await this.repo.get_attendance(filter);

        const isFiltering = filter && Object.keys(filter).length > 0;

        if (isFiltering && result.length === 0) {
            throw new HttpError(404, 'Attendance not found', 'ATTENDANCE_NOT_FOUND', true);
        }

        return filter.id ? result[0] : result;
    }

    async delete_attendance(id: number): Promise<any> {
        const existingAttendance = await this.repo.get_attendance({ id });

        if (existingAttendance.length === 0) {
            throw new HttpError(404, 'Attendance not found', 'ATTENDANCE_NOT_FOUND', true);
        }

        return await this.repo.delete_attendance(id);
    }

    async report_teacher(filter: {
        teacher_id?: number;
        from_date?: string;
        to_date?: string;
    }): Promise<any> {
        return await this.repo.report_teacher(filter);
    }
}
