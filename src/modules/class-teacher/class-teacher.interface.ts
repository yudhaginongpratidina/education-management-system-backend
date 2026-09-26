import type { Request, Response, NextFunction } from 'express';
import type { ClassTeacherRole, QueryExecutor } from '../../shared/class/class.types';

// ============================================================
// CLASS TEACHER REPOSITORY / SERVICE / CONTROLLER
// ============================================================
export interface IClassTeacherRepository {
    findByClass(classId: number): Promise<any>;
    findById(id: number): Promise<any>;
    create(
        data: {
            class_id: number;
            teacher_id: number;
            role: ClassTeacherRole;
            started_at: string;
            ended_at?: string | null;
        },
        executor?: QueryExecutor,
    ): Promise<any>;
    update(
        id: number,
        data: { role?: ClassTeacherRole; started_at?: string; ended_at?: string | null },
    ): Promise<any>;
    delete(id: number): Promise<void>;
    teacherExists(teacherId: number): Promise<boolean>;
    isTeacherAssignedToBranch(teacherId: number, branchId: number): Promise<boolean>;
    findOverlappingAssignments(
        classId: number,
        startedAt: string,
        endedAt: string | null,
        role: ClassTeacherRole,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any>;
    findActiveAssignmentOnDate(
        classId: number,
        date: string,
        role: ClassTeacherRole,
        executor?: QueryExecutor,
    ): Promise<any>;
    findActiveAssignmentsForTeacher(
        classId: number,
        teacherId: number,
        date: string,
        executor?: QueryExecutor,
    ): Promise<any>;
}

export interface IClassTeacherService {
    getClassTeachers(classId: number): Promise<any>;
    addClassTeacher(
        classId: number,
        data: {
            teacher_id: number;
            role: ClassTeacherRole;
            started_at: string;
            ended_at?: string | null;
        },
    ): Promise<any>;
    updateClassTeacher(
        classId: number,
        id: number,
        data: { role?: ClassTeacherRole; started_at?: string; ended_at?: string | null },
    ): Promise<any>;
    removeClassTeacher(classId: number, id: number): Promise<any>;
    getActivePrimaryTeacher(classId: number, date: string): Promise<any>;
}

export interface IClassTeacherController {
    getClassTeachers(req: Request, res: Response, next: NextFunction): Promise<void>;
    addClassTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateClassTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeClassTeacher(req: Request, res: Response, next: NextFunction): Promise<void>;
}
