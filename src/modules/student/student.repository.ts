import type { DatabaseClient } from '../../config/database/types';
import type { IStudentRepository, Student } from './student.interface';

export class StudentRepository implements IStudentRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
        const query = `
            INSERT INTO students (
                full_name, address, place_birth, birth_date, school_level,
                father_name, mother_name, guardian_name, guardian_phone_number,
                instagram, information_source, photos_of_children_may_be_posted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const result = await this.db.query(query, [
            data.full_name,
            data.address,
            data.place_birth,
            data.birth_date,
            data.school_level,
            data.father_name,
            data.mother_name,
            data.guardian_name,
            data.guardian_phone_number,
            data.instagram,
            data.information_source,
            data.photos_of_children_may_be_posted ? 1 : 0,
        ]);

        const selectQuery = `SELECT * FROM students WHERE id = LAST_INSERT_ID();`;
        const selectResult = await this.db.query(selectQuery, []);
        return selectResult.rows[0];
    }

    async findAll(): Promise<Student[]> {
        const query = `SELECT * FROM students;`;
        const result = await this.db.query(query, []);
        return result.rows;
    }

    async findById(id: number): Promise<Student | null> {
        const query = `SELECT * FROM students WHERE id = ?;`;
        const result = await this.db.query(query, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findByFullName(full_name: string, excludeId?: number): Promise<Student | null> {
        const conditions = ['LOWER(TRIM(full_name)) = LOWER(TRIM(?))'];
        const values: unknown[] = [full_name];

        if (excludeId !== undefined) {
            conditions.push('id <> ?');
            values.push(excludeId);
        }

        const query = `SELECT * FROM students WHERE ${conditions.join(' AND ')} LIMIT 1;`;
        const result = await this.db.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async update(
        id: number,
        data: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>,
    ): Promise<Student | null> {
        const fields: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(key === 'photos_of_children_may_be_posted' ? (value ? 1 : 0) : value);
            }
        }

        if (fields.length === 0) return await this.findById(id);

        values.push(id);
        const query = `UPDATE students SET ${fields.join(', ')} WHERE id = ?;`;
        await this.db.query(query, values);

        return await this.findById(id);
    }

    async delete(id: number): Promise<void> {
        const query = `DELETE FROM students WHERE id = ?;`;
        await this.db.query(query, [id]);
    }
}
