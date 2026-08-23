import type { DatabaseClient } from '../../config/database/types';
import type { IAuthRepository } from './auth.interface';

export class AuthRepository implements IAuthRepository {
    constructor(private readonly db: DatabaseClient) {}

    async login(email: string): Promise<any> {
        const query = `SELECT * FROM users WHERE email = ?;`;
        const result = await this.db.query(query, [email]);
        return result.rows[0];
    }
}
