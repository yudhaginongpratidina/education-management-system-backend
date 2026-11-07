import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../core/errors/http.error';

export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !user.role) {
            throw new HttpError(401, 'Autentikasi diperlukan', 'UNAUTHENTICATED', true);
        }

        const normalizedUserRole = String(user.role).toLowerCase().replace(/\s+/g, '-');
        const isAllowed = allowedRoles.some((role) => {
            const normalizedAllowed = role.toLowerCase().replace(/\s+/g, '-');
            return normalizedUserRole === normalizedAllowed;
        });

        if (!isAllowed) {
            throw new HttpError(
                403,
                'Akses ditolak. Fitur ini hanya dapat diakses oleh Super Admin.',
                'FORBIDDEN',
                true,
            );
        }

        next();
    };
};

export const requireSuperAdmin = requireRole('super-admin', 'super admin');
