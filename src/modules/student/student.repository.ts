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
        await this.db.query(query, [
            data.full_name,
            data.address ?? null,
            data.place_birth ?? null,
            data.birth_date ?? null,
            data.school_level ?? null,
            data.father_name ?? null,
            data.mother_name ?? null,
            data.guardian_name ?? null,
            data.guardian_phone_number ?? null,
            data.instagram ?? null,
            data.information_source ?? null,
            data.photos_of_children_may_be_posted ? 1 : 0,
        ]);

        const selectQuery = `SELECT * FROM students WHERE id = LAST_INSERT_ID();`;
        const selectResult = await this.db.query(selectQuery, []);
        return selectResult.rows[0];
    }

    async findAll(): Promise<Student[]> {
        const query = `SELECT * FROM students ORDER BY id DESC;`;
        const result = await this.db.query(query, []);
        return result.rows;
    }

    async findAllWithPrograms(): Promise<Student[]> {
        const query = `
            SELECT 
                s.*,
                sp.id as student_program_id,
                sp.branch_id,
                b.name as branch_name,
                p.id as program_id,
                p.name as program_name,
                p.slug as program_slug,
                pl.id as program_level_id,
                pl.name as level_name,
                pp.id as program_package_id,
                pp.name as package_name,
                sp.status as program_status
            FROM students s
            LEFT JOIN (
                SELECT sp1.*
                FROM student_programs sp1
                INNER JOIN (
                    SELECT student_id, MAX(id) as max_id
                    FROM student_programs
                    GROUP BY student_id
                ) latest_sp ON sp1.id = latest_sp.max_id
            ) sp ON sp.student_id = s.id
            LEFT JOIN branches b ON sp.branch_id = b.id
            LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
            LEFT JOIN programs p ON pp.program_id = p.id
            LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
            ORDER BY s.id DESC;
        `;
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

    async getPackage(packageId: number): Promise<any | null> {
        const query = `SELECT * FROM program_packages WHERE id = ?;`;
        const result = await this.db.query(query, [packageId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async getDefaultPackageByProgramOrLevel(params: {
        program_package_id?: number;
        program_level_id?: number;
        program_slug?: string;
    }): Promise<any | null> {
        if (params.program_package_id) {
            return await this.getPackage(params.program_package_id);
        }

        if (params.program_level_id) {
            const query = `
                SELECT pp.*
                FROM program_levels pl
                JOIN program_packages pp ON pp.program_id = pl.program_id
                WHERE pl.id = ? AND pp.status = 'ACTIVE'
                ORDER BY pp.id ASC
                LIMIT 1;
            `;
            const result = await this.db.query(query, [params.program_level_id]);
            if (result.rows.length > 0) return result.rows[0];
        }

        if (params.program_slug) {
            const query = `
                SELECT pp.*
                FROM programs p
                JOIN program_packages pp ON pp.program_id = p.id
                WHERE p.slug = ? AND pp.status = 'ACTIVE'
                ORDER BY pp.id ASC
                LIMIT 1;
            `;
            const result = await this.db.query(query, [params.program_slug]);
            if (result.rows.length > 0) return result.rows[0];
        }

        // Fallback to any active package if needed
        const fallbackQuery = `SELECT * FROM program_packages WHERE status = 'ACTIVE' ORDER BY id ASC LIMIT 1;`;
        const fallbackRes = await this.db.query(fallbackQuery, []);
        return fallbackRes.rows.length > 0 ? fallbackRes.rows[0] : null;
    }

    async assignProgram(data: {
        student_id: number;
        branch_id: number;
        program_package_id: number;
        program_level_id: number;
        status: string;
        started_at?: string;
        ended_at?: string;
        normal_price: number;
        selling_price: number;
        notes?: string;
        duration_months?: number;
        sessions_per_period?: number;
        session_period?: string;
        total_sessions?: number;
    }): Promise<any> {
        const query = `
            INSERT INTO student_programs (
                student_id, branch_id, program_package_id, program_level_id,
                status, started_at, ended_at, normal_price, selling_price, notes,
                duration_months, sessions_per_period, session_period, total_sessions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await this.db.query(query, [
            data.student_id,
            data.branch_id,
            data.program_package_id,
            data.program_level_id,
            data.status,
            data.started_at ?? null,
            data.ended_at ?? null,
            data.normal_price,
            data.selling_price,
            data.notes ?? null,
            data.duration_months ?? null,
            data.sessions_per_period ?? null,
            data.session_period ?? null,
            data.total_sessions ?? null,
        ]);

        const selectQuery = `SELECT * FROM student_programs WHERE id = LAST_INSERT_ID();`;
        const selectResult = await this.db.query(selectQuery, []);
        return selectResult.rows[0];
    }
}
