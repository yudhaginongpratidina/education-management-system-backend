import type { Request, Response, NextFunction } from 'express';

export interface IAuthRepository {
    login(email: string): Promise<any>;
    find_user_by_id(user_id: string): Promise<any>;
    change_password(user_id: string, password_hash: string): Promise<any>;
}

export interface IAuthService {
    login(email: string, password: string): Promise<any>;
    me(user_id: string): Promise<any>;
    change_password(user_id: string, password_hash: string): Promise<any>;
}

export interface IAuthController {
    login(req: Request, res: Response, next: NextFunction): Promise<any>;
    me(req: Request, res: Response): Promise<any>;
    logout(req: Request, res: Response): Promise<any>;
    change_password(req: Request, res: Response, next: NextFunction): Promise<any>;
}
