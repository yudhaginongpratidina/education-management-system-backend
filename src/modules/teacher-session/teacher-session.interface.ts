import type { Request, Response, NextFunction } from 'express';
import type {
    ClassSessionStatus,
    Pagination,
    QueryExecutor,
    SessionAttendanceStatus,
} from '../../shared/class/class.types';

// Time window shortcuts used by the teacher "my sessions" screen.
export type TeacherSessionPeriod = 'today' | 'week' | 'month' | 'upcoming' | 'past';

export interface TeacherSessionFilter {
    teacher_id?: number;
    scheduled_date?: string;
    date_from?: string;
    date_to?: string;
    status?: ClassSessionStatus;
    period?: TeacherSessionPeriod;
}

// ============================================================
// REPOSITORY
// ============================================================
export interface ITeacherSessionRepository {
    // Resolve the teacher profile attached to the authenticated user.
    findTeacherByUserId(userId: number): Promise<any | null>;

    // Sessions taught by the teacher, including class & branch (location) info.
    findAll(filter: TeacherSessionFilter, pagination?: Pagination): Promise<any[]>;

    // A single session with class & branch (location) info.
    findById(sessionId: number, executor?: QueryExecutor): Promise<any | null>;

    // Recurring weekly schedule of every class the teacher is assigned to.
    findSchedule(teacherId: number): Promise<any[]>;

    // Count of sessions per status for the teacher (drives the summary cards).
    findSummary(teacherId: number, filter: TeacherSessionFilter): Promise<any[]>;

    // Update the lifecycle status of a session.
    updateStatus(sessionId: number, status: ClassSessionStatus): Promise<any | null>;
}

// ============================================================
// SERVICE
// ============================================================
export interface ITeacherSessionService {
    resolveTeacher(userId: number): Promise<any>;
    getMySessions(
        userId: number,
        filter: TeacherSessionFilter,
        pagination?: Pagination,
    ): Promise<any[]>;
    getMySummary(userId: number, filter: TeacherSessionFilter): Promise<any>;
    getMySchedule(userId: number): Promise<any[]>;
    getMySessionDetail(userId: number, sessionId: number): Promise<any>;
    getMySessionStudents(userId: number, sessionId: number): Promise<any[]>;
    updateMySessionStatus(
        userId: number,
        sessionId: number,
        status: ClassSessionStatus,
    ): Promise<any>;
    updateMyAttendance(
        userId: number,
        sessionId: number,
        studentProgramId: number,
        data: { attendance_status: SessionAttendanceStatus; notes?: string | null },
    ): Promise<any>;
    bulkUpdateMyAttendance(
        userId: number,
        sessionId: number,
        records: {
            student_program_id: number;
            attendance_status: SessionAttendanceStatus;
            notes?: string | null;
        }[],
    ): Promise<any[]>;
}

// ============================================================
// CONTROLLER
// ============================================================
export interface ITeacherSessionController {
    getMySessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMySummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMySchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMySession(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMySessionStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMySessionStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMyAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    bulkUpdateMyAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
}
