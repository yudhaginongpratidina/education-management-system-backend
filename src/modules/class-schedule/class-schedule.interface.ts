import type { Request, Response, NextFunction } from 'express';
import type { QueryExecutor } from '../../shared/class/class.types';

// ============================================================
// CLASS SCHEDULE REPOSITORY / SERVICE / CONTROLLER
// ============================================================
export interface IClassScheduleRepository {
    findByClass(classId: number): Promise<any>;
    findById(id: number): Promise<any>;
    create(
        data: {
            class_id: number;
            day_of_week: number;
            start_time: string;
            end_time: string;
            effective_from: string;
            effective_until?: string | null;
            is_active?: boolean;
        },
        executor?: QueryExecutor,
    ): Promise<any>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<void>;
    findConflicts(
        classId: number,
        dayOfWeek: number,
        startTime: string,
        endTime: string,
        effectiveFrom: string,
        effectiveUntil: string | null,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
}

export interface IClassScheduleService {
    getClassSchedules(classId: number): Promise<any>;
    addClassSchedule(classId: number, data: any): Promise<any>;
    updateClassSchedule(classId: number, id: number, data: any): Promise<any>;
    removeClassSchedule(classId: number, id: number): Promise<any>;
}

export interface IClassScheduleController {
    getClassSchedules(req: Request, res: Response, next: NextFunction): Promise<void>;
    addClassSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateClassSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeClassSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
}
