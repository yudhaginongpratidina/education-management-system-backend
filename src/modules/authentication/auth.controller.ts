import type { Request, Response, NextFunction } from 'express';
import type { IAuthController, IAuthService } from './auth.interface';

export class AuthController implements IAuthController {
    constructor(private readonly service: IAuthService) {}

    login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { email, password } = req.body;
            const response = await this.service.login(email, password);
            res.status(200).json({ success: true, message: 'User logged in', data: response });
        } catch (error) {
            next(error);
        }
    };
}
