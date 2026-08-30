import type { DatabaseClient } from '../../config/database/types';
import type { IAuthRepository } from './auth.interface';

export class AuthRepository implements IAuthRepository {
    constructor(private readonly db: DatabaseClient) {}

    async login(email: string): Promise<any> {
        const query = `SELECT * FROM users WHERE email = ?;`;
        const result = await this.db.query(query, [email]);
        return result.rows[0];
    }

    async find_user_by_id(user_id: string): Promise<any> {
        const query = `SELECT * FROM users WHERE id = ?;`;
        const result = await this.db.query(query, [user_id]);
        return result.rows[0];
    }

    async change_password(user_id: string, password_hash: string): Promise<any> {
        const query = `UPDATE users SET password_hash = ? WHERE id = ?;`;
        return await this.db.query(query, [password_hash, user_id]);
    }
}
