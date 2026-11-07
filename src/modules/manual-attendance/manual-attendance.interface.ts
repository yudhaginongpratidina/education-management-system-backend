import type { Request, Response, NextFunction } from 'express';

export type AttendanceStatus =
    'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE' | 'REMOTE' | 'OFFICIAL_DUTY' | 'HOLIDAY' | 'LATE';

export interface IManualAttendanceInput {
    teacher_id: number;
    branch_id: number;
    attendance_date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    check_in_at?: string | null;
    check_in_photo?: string | null;
    check_out_at?: string | null;
    check_out_photo?: string | null;
    notes?: string | null;
    is_approved?: boolean;
}

export interface IManualAttendanceFilter {
    teacher_id?: number;
    branch_id?: number;
    status?: AttendanceStatus;
    date?: string;
    from_date?: string;
    to_date?: string;
}

export interface IManualAttendanceRecord {
    id: number;
    teacher_id: number;
    teacher_name?: string;
    teacher_slug?: string;
    branch_id: number;
    branch_name?: string;
    branch_slug?: string;
    status: AttendanceStatus;
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
    is_approved: boolean;
    created_at: string;
    updated_at: string;
}

export interface IManualAttendanceRepository {
    record(data: IManualAttendanceInput): Promise<IManualAttendanceRecord>;
    get(filter: IManualAttendanceFilter): Promise<IManualAttendanceRecord[]>;
    getById(id: number): Promise<IManualAttendanceRecord | null>;
    update(id: number, data: Partial<IManualAttendanceInput>): Promise<IManualAttendanceRecord>;
    delete(id: number): Promise<void>;
}

export interface IManualAttendanceService {
    record(
        data: IManualAttendanceInput,
        adminUserId?: number | null,
    ): Promise<IManualAttendanceRecord>;
    get(filter: IManualAttendanceFilter): Promise<IManualAttendanceRecord[]>;
    getById(id: number): Promise<IManualAttendanceRecord>;
    update(
        id: number,
        data: Partial<IManualAttendanceInput>,
        adminUserId?: number | null,
    ): Promise<IManualAttendanceRecord>;
    delete(id: number): Promise<void>;
}

export interface IManualAttendanceController {
    record(req: Request, res: Response, next: NextFunction): Promise<void>;
    get(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
