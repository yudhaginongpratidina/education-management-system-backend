// dependencies
import type { Request, Response, NextFunction } from 'express';

// core
import { HttpError } from '../../core/errors/http.error';

// libs
import { decode_token } from '../libs/jwt';

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const auth_header = req.headers.authorization;

        const token = auth_header?.split(' ')[1];
        if (!token) {
            throw new HttpError(401, 'Authentication required', 'NOT_AUTHENTICATED', true);
        }

        const decoded = decode_token(token);
        if (!decoded.sid) {
            throw new HttpError(401, 'Invalid session', 'INVALID_SESSION', true);
        }

        (req as any).user = {
            id: decoded.sub,
            session_id: decoded.sid,
        };
        next();
    } catch (error) {
        next(error);
    }
}
