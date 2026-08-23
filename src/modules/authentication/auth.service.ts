// core and shared
import { HttpError } from '../../core/errors/http.error';
import { compare_password } from '../../shared/libs/password';

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

        // Return user data without password hash
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
