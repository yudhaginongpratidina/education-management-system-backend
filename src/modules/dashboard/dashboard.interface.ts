import type { Request, Response, NextFunction } from 'express';

export interface IDashboardRepository {
    get_total_branch(): Promise<any>;
    get_total_teacher(): Promise<any>;
    get_total_program(): Promise<any>;
    get_total_role(): Promise<any>;
    get_total_menu(): Promise<any>;
    get_total_user(): Promise<any>;

    // ---------- rich overview ----------
    get_kpis(): Promise<any>;
    get_student_program_status(): Promise<any[]>;
    get_enrollment_trend(months: number): Promise<any[]>;
    get_session_stats(): Promise<any>;
    get_student_attendance_stats(days: number): Promise<any[]>;
    get_teacher_attendance_today(): Promise<any[]>;
    get_teacher_checked_in_today(): Promise<number>;
    get_branch_performance(): Promise<any[]>;
    get_top_programs(limit: number): Promise<any[]>;
    get_upcoming_sessions(limit: number): Promise<any[]>;
    get_recent_enrollments(limit: number): Promise<any[]>;
    get_teacher_leaderboard(limit: number): Promise<any[]>;
    get_attention_counts(): Promise<any>;
}

export interface IDashboardService {
    get_total_branch(): Promise<any>;
    get_total_teacher(): Promise<any>;
    get_total_program(): Promise<any>;
    get_total_role(): Promise<any>;
    get_total_menu(): Promise<any>;
    get_total_user(): Promise<any>;

    getOverview(): Promise<any>;
}

export interface IDashboardController {
    get_total_branch(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_teacher(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_program(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_role(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_user(req: Request, res: Response, next: NextFunction): Promise<any>;

    get_overview(req: Request, res: Response, next: NextFunction): Promise<any>;
}
