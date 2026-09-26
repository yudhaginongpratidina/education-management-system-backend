import type { Request, Response, NextFunction } from 'express';
import type {
    ClassSessionStatus,
    Pagination,
    QueryExecutor,
    SessionAttendanceStatus,
} from '../../shared/class/class.types';

export interface SessionListFilter {
    class_id?: number;
    teacher_id?: number;
    branch_id?: number;
    scheduled_date?: string;
    date_from?: string;
    date_to?: string;
    status?: ClassSessionStatus;
}

// ============================================================
// CLASS SESSION REPOSITORY / SERVICE
// ============================================================
export interface IClassSessionRepository {
    create(
        data: {
            class_id: number;
            scheduled_date: string;
            start_time: string;
            end_time: string;
            teacher_id: number;
            status?: ClassSessionStatus;
            notes?: string | null;
        },
        executor?: QueryExecutor,
    ): Promise<any>;
    findAll(filter: SessionListFilter, pagination?: Pagination): Promise<any>;
    findById(id: number, executor?: QueryExecutor): Promise<any>;
    update(
        id: number,
        data: {
            scheduled_date?: string;
            start_time?: string;
            end_time?: string;
            teacher_id?: number;
            status?: ClassSessionStatus;
            notes?: string | null;
        },
        executor?: QueryExecutor,
    ): Promise<any>;
    delete(id: number): Promise<void>;
    findClassConflicts(
        classId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
    findTeacherConflicts(
        teacherId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
    findExistingSession(
        classId: number,
        date: string,
        startTime: string,
        endTime: string,
        executor?: QueryExecutor,
    ): Promise<any>;
    findByClassAndDate(classId: number, from: string, to: string): Promise<any>;
    findCalendar(filter: SessionListFilter): Promise<any>;
}

export interface IClassSessionService {
    getClassSessions(classId: number, filter: SessionListFilter): Promise<any>;
    getSessions(filter: SessionListFilter, pagination?: Pagination): Promise<any>;
    getSessionById(id: number): Promise<any>;
    createClassSession(classId: number, data: any): Promise<any>;
    updateSession(id: number, data: any): Promise<any>;
    deleteSession(id: number): Promise<void>;
    rescheduleSession(id: number, data: any): Promise<any>;
    substituteTeacher(
        id: number,
        data: { teacher_id: number; notes?: string | null },
    ): Promise<any>;
    getCalendar(filter: SessionListFilter): Promise<any>;
}

// ============================================================
// CLASS SESSION STUDENT REPOSITORY / SERVICE
// ============================================================
export interface IClassSessionStudentRepository {
    findBySession(sessionId: number): Promise<any>;
    findParticipant(
        sessionId: number,
        studentProgramId: number,
        executor?: QueryExecutor,
    ): Promise<any>;
    create(
        data: {
            session_id: number;
            student_program_id: number;
            attendance_status?: SessionAttendanceStatus;
            notes?: string | null;
        },
        executor?: QueryExecutor,
    ): Promise<void>;
    update(
        sessionId: number,
        studentProgramId: number,
        data: { attendance_status?: SessionAttendanceStatus; notes?: string | null },
        executor?: QueryExecutor,
    ): Promise<any>;
    remove(sessionId: number, studentProgramId: number): Promise<void>;
    studentProgramExists(studentProgramId: number): Promise<boolean>;
    getStudentProgram(studentProgramId: number): Promise<any>;
    isMemberOfClass(classId: number, studentProgramId: number): Promise<boolean>;
    findStudentConflicts(
        studentProgramId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
}

export interface IClassSessionStudentService {
    getSessionStudents(sessionId: number): Promise<any>;
    addSessionStudent(sessionId: number, data: any): Promise<any>;
    updateSessionStudent(sessionId: number, studentProgramId: number, data: any): Promise<any>;
    removeSessionStudent(sessionId: number, studentProgramId: number): Promise<any>;
    updateAttendance(
        sessionId: number,
        studentProgramId: number,
        data: { attendance_status: SessionAttendanceStatus; notes?: string | null },
    ): Promise<any>;
    bulkUpdateAttendance(
        sessionId: number,
        records: {
            student_program_id: number;
            attendance_status: SessionAttendanceStatus;
            notes?: string | null;
        }[],
    ): Promise<any>;
}

// ============================================================
// SESSION GENERATION SERVICE
// ============================================================
export interface ISessionGenerationService {
    generateForClass(
        classId: number,
        from: string,
        to: string,
    ): Promise<{ created: number; skipped: number }>;
}

// ============================================================
// SESSION CONTROLLER
// ============================================================
export interface ISessionController {
    getClassSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    createClassSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    rescheduleSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    substituteTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCalendar(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSessionStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    addSessionStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSessionStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeSessionStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
    bulkUpdateAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
}
