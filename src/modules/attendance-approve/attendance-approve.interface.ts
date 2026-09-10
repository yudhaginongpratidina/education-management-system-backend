import type { Request, Response, NextFunction } from 'express';

export interface IAttendanceApproveRepository {
    approve_attendance(data: {
        id: number;
        is_approved: boolean;
        notes?: string | null;
    }): Promise<any>;
    get_unapproved_attendances(branch_id: number): Promise<any[]>;
}

export interface IAttendanceApproveService {
    approve_attendance(data: {
        id: number;
        is_approved: boolean;
        notes?: string | null;
    }): Promise<any>;
    get_unapproved_attendances(branch_id: number): Promise<any[]>;
}

export interface IAttendanceApproveController {
    approve_attendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_unapproved_attendances(req: Request, res: Response, next: NextFunction): Promise<void>;
}
