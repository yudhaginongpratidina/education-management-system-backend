import type { DatabaseClient } from '../../config/database/types';
import type { IStudentProgramRepository, StudentProgram } from './student-program.interface';

export class StudentProgramRepository implements IStudentProgramRepository {
    constructor(private readonly db: DatabaseClient) {}

    private readonly baseQuery = `
        SELECT sp.*, 
               s.full_name as student_full_name,
               b.name as branch_name,
               pp.name as package_name,
               pp.duration_months as package_duration_months,
               pp.sessions_per_period as package_sessions_per_period,
               pp.session_period as package_session_period,
               pp.bonus_duration_months as package_bonus_duration_months,
               pl.name as level_name
        FROM student_programs sp
        LEFT JOIN students s ON sp.student_id = s.id
        LEFT JOIN branches b ON sp.branch_id = b.id
        LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
        LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
    `;

    async create(
        data: Omit<
            StudentProgram,
            | 'id'
            | 'created_at'
            | 'updated_at'
            | 'student'
            | 'branch'
            | 'program_package'
            | 'program_level'
        >,
    ): Promise<StudentProgram> {
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

    async findAll(filter: any = {}): Promise<StudentProgram[]> {
        let query = this.baseQuery;
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.status) {
            conditions.push('sp.status = ?');
            values.push(filter.status);
        }
        if (filter.student_id) {
            conditions.push('sp.student_id = ?');
            values.push(filter.student_id);
        }
        if (filter.branch_id) {
            conditions.push('sp.branch_id = ?');
            values.push(filter.branch_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const result = await this.db.query(query, values);
        return result.rows.map((row) => ({
            ...row,
            student: { id: row.student_id, full_name: row.student_full_name },
            branch: { id: row.branch_id, name: row.branch_name },
            program_package: { id: row.program_package_id, name: row.package_name },
            program_level: { id: row.program_level_id, name: row.level_name },
        }));
    }

    async findById(id: number): Promise<StudentProgram | null> {
        const query = `${this.baseQuery} WHERE sp.id = ?;`;
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            ...row,
            student: { id: row.student_id, full_name: row.student_full_name },
            branch: { id: row.branch_id, name: row.branch_name },
            program_package: { id: row.program_package_id, name: row.package_name },
            program_level: { id: row.program_level_id, name: row.level_name },
        };
    }

    async update(
        id: number,
        data: Partial<
            Omit<
                StudentProgram,
                | 'id'
                | 'created_at'
                | 'updated_at'
                | 'student'
                | 'branch'
                | 'program_package'
                | 'program_level'
            >
        >,
    ): Promise<StudentProgram | null> {
        const fields: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return await this.findById(id);

        values.push(id);
        const query = `UPDATE student_programs SET ${fields.join(', ')} WHERE id = ?;`;
        await this.db.query(query, values);

        return await this.findById(id);
    }

    async delete(id: number): Promise<void> {
        const query = `DELETE FROM student_programs WHERE id = ?;`;
        await this.db.query(query, [id]);
    }

    async getPackage(packageId: number): Promise<any | null> {
        const result = await this.db.query(
            `SELECT id, program_id, name, duration_months, sessions_per_period, session_period,
                    normal_price, selling_price, bonus_duration_months, status
             FROM program_packages WHERE id = ? LIMIT 1;`,
            [packageId],
        );
        return result.rows[0] ?? null;
    }

    async getSessionUsage(studentProgramId: number): Promise<any> {
        const result = await this.db.query(
            `SELECT
                COUNT(*) AS total_scheduled,
                SUM(CASE WHEN css.attendance_status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN css.attendance_status = 'ABSENT' THEN 1 ELSE 0 END) AS absent,
                SUM(CASE WHEN css.attendance_status = 'SICK' THEN 1 ELSE 0 END) AS sick,
                SUM(CASE WHEN css.attendance_status = 'PERMISSION' THEN 1 ELSE 0 END) AS permission,
                SUM(CASE WHEN css.attendance_status = 'RESCHEDULED' THEN 1 ELSE 0 END) AS rescheduled
             FROM class_session_students css
             JOIN class_sessions cs ON css.session_id = cs.id
             WHERE css.student_program_id = ?;`,
            [studentProgramId],
        );
        return result.rows[0] ?? {};
    }
}
