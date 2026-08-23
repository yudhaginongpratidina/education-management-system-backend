import type { Request, Response, NextFunction } from 'express';
import type { IAuthController, IAuthService } from './auth.interface';

// config
import { cookie_options } from '../../config/cookie';

export class AuthController implements IAuthController {
    constructor(private readonly service: IAuthService) {}

    login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { email, password } = req.body;
            const response = await this.service.login(email, password);
            res.cookie('authenticated', true, cookie_options);
            res.status(200).json({ success: true, message: 'User logged in', data: response });
        } catch (error) {
            next(error);
        }
    };

    me = async (req: Request, res: Response): Promise<any> => {
        const user = (req as any).user;
        const response = await this.service.me(user.id);
        return res.status(200).json({
            success: true,
            data: response,
        });
    };

    logout = async (req: Request, res: Response) => {
        res.clearCookie('authenticated', cookie_options);

        return res.status(200).json({
            success: true,
            message: 'Logout successfully',
        });
    };
}
