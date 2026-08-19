// dependencies
import jwt, { type SignOptions, type JwtPayload, type Algorithm } from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// core
import { HttpError } from '../../core/errors/http.error';

// config
import { env } from '../../config/env';

export interface DecodedToken extends JwtPayload {
    sub: string;
    sid: string;
}

export function generate_tokens(id: string) {
    const session_id = randomUUID();

    const accessPayload = {
        sub: id,
        sid: session_id,
        iss: env.jwt.issuer,
        aud: env.jwt.audience,
    };

    const access_token = jwt.sign(accessPayload, env.jwt.accessTokenSecret, {
        expiresIn: env.jwt.accessTokenExpiry,
        algorithm: env.jwt.algorithm,
    } as SignOptions);

    return { access_token, session_id };
}

export function decode_token(token: string): DecodedToken {
    try {
        if (!token) {
            throw new HttpError(401, 'Token is required', 'TOKEN_REQUIRED', true);
        }

        const decoded = jwt.verify(token, env.jwt.accessTokenSecret, {
            algorithms: [env.jwt.algorithm as Algorithm],
            issuer: env.jwt.issuer,
            audience: env.jwt.audience,
        }) as DecodedToken;

        if (!decoded.sub || !decoded.sid) {
            throw new HttpError(401, 'Token payload invalid', 'INVALID_TOKEN', true);
        }

        return decoded;
    } catch (err: any) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new HttpError(
                401,
                'Your access token has expired.',
                'ACCESS_TOKEN_EXPIRED',
                true,
            );
        }

        throw new HttpError(401, 'Token is invalid', 'INVALID_TOKEN', true);
    }
}