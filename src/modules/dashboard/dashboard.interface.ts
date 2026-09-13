import type { Request, Response, NextFunction } from 'express';

export interface IDashboardRepository {
    get_total_branch(): Promise<any>;
    get_total_teacher(): Promise<any>;
    get_total_program(): Promise<any>;
    get_total_role(): Promise<any>;
    get_total_menu(): Promise<any>;
    get_total_user(): Promise<any>;
}

export interface IDashboardService {
    get_total_branch(): Promise<any>;
    get_total_teacher(): Promise<any>;
    get_total_program(): Promise<any>;
    get_total_role(): Promise<any>;
    get_total_menu(): Promise<any>;
    get_total_user(): Promise<any>;
}

export interface IDashboardController {
    get_total_branch(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_teacher(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_program(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_role(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_menu(req: Request, res: Response, next: NextFunction): Promise<any>;
    get_total_user(req: Request, res: Response, next: NextFunction): Promise<any>;
}
