import type { Request, Response, NextFunction } from 'express';

export interface IAuthRepository {
    login(email: string): Promise<any>;
}

export interface IAuthService {
    login(email: string, password: string): Promise<any>;
}

export interface IAuthController {
    login(req: Request, res: Response, next: NextFunction): Promise<any>;
}
