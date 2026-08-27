import type { DatabaseClient } from '../../config/database/types';
import type { ITeacherRepository } from './teacher.interface';

export class TeacherRepository implements ITeacherRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_teacher(data: {
        full_name: string;
        slug: string;
        user_id: string;
        phone_number: string;
        address: string;
        place_and_dob: string;
        last_education: string;
        photo: string;
    }): Promise<any> {
        const query = `INSERT INTO teachers (full_name, slug, user_id, phone_number, address, place_and_dob, last_education, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
        await this.db.query(query, [
            data.full_name,
            data.slug,
            data.user_id,
            data.phone_number,
            data.address,
            data.place_and_dob,
            data.last_education,
            data.photo,
        ]);
        const selectQuery = `SELECT * FROM teachers WHERE slug = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.slug]);
        return result.rows[0];
    }

    async get_teacher(filter: {
        id?: number;
        full_name?: string;
        slug?: string;
        phone_number?: string;
    }): Promise<any> {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.id !== undefined) {
            conditions.push('id = ?');
            values.push(filter.id);
        }
        if (filter.full_name !== undefined) {
            conditions.push('full_name = ?');
            values.push(filter.full_name);
        }
        if (filter.slug !== undefined) {
            conditions.push('slug = ?');
            values.push(filter.slug);
        }
        if (filter.phone_number !== undefined) {
            conditions.push('phone_number = ?');
            values.push(filter.phone_number);
        }

        let query = `SELECT * FROM teachers`;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const response = await this.db.query(query, values);
        return response.rows;
    }

    async update_teacher(data: {
        id: number;
        full_name: string;
        slug: string;
        user_id?: string;
        phone_number: string | null;
        address: string | null;
        place_and_dob: string | null;
        last_education: string | null;
        photo: string | null;
    }): Promise<any> {
        const query = `UPDATE teachers SET full_name = ?, slug = ?, phone_number = ?, address = ?, place_and_dob = ?, last_education = ?, photo = ? WHERE id = ?;`;
        await this.db.query(query, [
            data.full_name,
            data.slug,
            data.phone_number ?? null,
            data.address ?? null,
            data.place_and_dob ?? null,
            data.last_education ?? null,
            data.photo ?? null,
            data.id,
        ]);
        const selectQuery = `SELECT * FROM teachers WHERE id = ? LIMIT 1;`;
        const result = await this.db.query(selectQuery, [data.id]);
        return result.rows[0];
    }

    async delete_teacher(slug: string): Promise<any> {
        const query = `DELETE FROM teachers WHERE slug = ?;`;
        return await this.db.query(query, [slug]);
    }
}
