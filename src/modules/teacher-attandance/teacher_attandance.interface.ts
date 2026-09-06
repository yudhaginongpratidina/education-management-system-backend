import type { Request, Response, NextFunction } from 'express';

export interface ITeacherAttendanceRepository {
    create_attendance(data: {
        teacher_id: number;
        branch_id: number;
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
        is_approved?: boolean;
    }): Promise<any>;
    update_attendance(data: {
        id: number;
        teacher_id: number;
        branch_id: number;
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
        is_approved?: boolean;
    }): Promise<any>;
    get_attendance(filter: {
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
    }): Promise<any>;
    delete_attendance(id: number): Promise<any>;
    report_teacher(filter: {
        teacher_id?: number;
        from_date?: string;
        to_date?: string;
    }): Promise<any>;
}

export interface ITeacherAttendanceService {
    create_attendance(data: {
        teacher_id: number;
        branch_id: number;
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
        is_approved?: boolean;
    }): Promise<any>;
    update_attendance(data: {
        id: number;
        teacher_id: number;
        branch_id: number;
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
        is_approved?: boolean;
    }): Promise<any>;
    get_attendance(filter: {
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
    }): Promise<any>;
    delete_attendance(id: number): Promise<any>;
    report_teacher(filter: {
        teacher_id?: number;
        from_date?: string;
        to_date?: string;
    }): Promise<any>;
}

export interface ITeacherAttendanceController {
    create_attendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    update_attendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_attendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete_attendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    report_teacher(req: Request, res: Response, next: NextFunction): Promise<void>;
}
