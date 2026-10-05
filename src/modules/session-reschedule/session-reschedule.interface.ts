import type { Request, Response, NextFunction } from 'express';
import type { QueryExecutor } from '../../shared/class/class.types';

export type SessionRescheduleType = 'SESSION' | 'TEACHER' | 'STUDENT';

export interface SessionRescheduleInput {
    type: SessionRescheduleType;
    class_id?: number | null;
    student_program_id?: number | null;
    from_session_id?: number | null;
    to_session_id?: number | null;
    from_teacher_id?: number | null;
    to_teacher_id?: number | null;
    reason?: string | null;
    created_by?: number | null;
}

export interface SessionRescheduleFilter {
    type?: SessionRescheduleType;
    class_id?: number;
    student_program_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface ISessionRescheduleRepository {
    create(data: SessionRescheduleInput, executor?: QueryExecutor): Promise<void>;
    findAll(
        filter: SessionRescheduleFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]>;
    findById(id: number): Promise<any | null>;
}

export interface ISessionRescheduleService {
    list(
        filter: SessionRescheduleFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]>;
}

export interface ISessionRescheduleController {
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
}
