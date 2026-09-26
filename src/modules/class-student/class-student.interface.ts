import type { Request, Response, NextFunction } from 'express';
import type { QueryExecutor } from '../../shared/class/class.types';

// ============================================================
// CLASS STUDENT REPOSITORY / SERVICE / CONTROLLER
// ============================================================
export interface IClassStudentRepository {
    findByClass(classId: number): Promise<any>;
    findMembership(classId: number, studentProgramId: number): Promise<any>;
    create(
        data: { class_id: number; student_program_id: number; joined_at: string },
        executor?: QueryExecutor,
    ): Promise<void>;
    update(
        classId: number,
        studentProgramId: number,
        data: { joined_at?: string; left_at?: string | null },
    ): Promise<any>;
    remove(classId: number, studentProgramId: number): Promise<void>;
    studentProgramExists(studentProgramId: number): Promise<boolean>;
    getStudentProgram(studentProgramId: number): Promise<any>;
    isActiveMember(classId: number, studentProgramId: number): Promise<boolean>;
}

export interface IClassStudentService {
    getClassStudents(classId: number): Promise<any>;
    addClassStudent(
        classId: number,
        data: { student_program_id: number; joined_at?: string },
    ): Promise<any>;
    updateClassStudent(
        classId: number,
        studentProgramId: number,
        data: { joined_at?: string; left_at?: string | null },
    ): Promise<any>;
    removeClassStudent(classId: number, studentProgramId: number): Promise<any>;
}

export interface IClassStudentController {
    getClassStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    addClassStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateClassStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeClassStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
}
