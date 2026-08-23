// core and shared
import { HttpError } from '../../core/errors/http.error';
import { compare_password } from '../../shared/libs/password';
import { generate_tokens } from '../../shared/libs/jwt';

// interface
import type { IAuthRepository, IAuthService } from './auth.interface';

export class AuthService implements IAuthService {
    constructor(
        private readonly repo: IAuthRepository,
        private container: any,
    ) {}

    async login(email: string, password: string): Promise<any> {
        const user = await this.repo.login(email);
        if (!user) {
            throw new HttpError(
                401,
                'Invalid email or password',
                'INVALID_EMAIL_OR_PASSWORD',
                true,
            );
        }

        const isPasswordValid = await compare_password(password, user.password_hash);
        if (!isPasswordValid) {
            throw new HttpError(
                401,
                'Invalid email or password',
                'INVALID_EMAIL_OR_PASSWORD',
                true,
            );
        }

        const { access_token } = generate_tokens(user.id.toString(), user.role);
        return {
            user: {
                email: user.email,
                avatar: user.avatar || null,
            },
            access_token,
        };
    }

    async me(user_id: string): Promise<any> {
        const user = await this.repo.find_user_by_id(user_id);
        if (!user) throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        return user;
    }
}
