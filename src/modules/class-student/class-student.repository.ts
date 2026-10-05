import type { DatabaseClient } from '../../config/database/types';
import type { QueryExecutor } from '../../shared/class/class.types';
import type { IClassStudentRepository } from './class-student.interface';

export class ClassStudentRepository implements IClassStudentRepository {
    constructor(private readonly db: DatabaseClient) {}

    private executor(executor?: QueryExecutor): QueryExecutor {
        return executor ?? this.db;
    }

    async findByClass(classId: number): Promise<any> {
        const query = `
            SELECT
                cs.class_id,
                cs.student_program_id,
                cs.joined_at,
                cs.left_at,
                sp.student_id,
                sp.branch_id,
                b.name as branch_name,
                sp.status as enrollment_status,
                s.full_name as student_name,
                pp.name as package_name,
                pl.name as level_name
            FROM class_students cs
            JOIN student_programs sp ON cs.student_program_id = sp.id
            JOIN students s ON sp.student_id = s.id
            LEFT JOIN branches b ON sp.branch_id = b.id
            LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
            LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
            WHERE cs.class_id = ?
            ORDER BY s.full_name ASC
        `;
        const result = await this.db.query(query, [classId]);
        return result.rows;
    }

    async findMembership(classId: number, studentProgramId: number): Promise<any> {
        const query = `SELECT * FROM class_students WHERE class_id = ? AND student_program_id = ? LIMIT 1;`;
        const result = await this.db.query(query, [classId, studentProgramId]);
        return result.rows[0] ?? null;
    }

    async create(
        data: { class_id: number; student_program_id: number; joined_at: string },
        executor?: QueryExecutor,
    ): Promise<void> {
        const query = `INSERT INTO class_students (class_id, student_program_id, joined_at) VALUES (?, ?, ?);`;
        await this.executor(executor).query(query, [
            data.class_id,
            data.student_program_id,
            data.joined_at,
        ]);
    }

    async update(
        classId: number,
        studentProgramId: number,
        data: { joined_at?: string; left_at?: string | null },
    ): Promise<any> {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (data.joined_at !== undefined) {
            fields.push('joined_at = ?');
            values.push(data.joined_at);
        }
        if (data.left_at !== undefined) {
            fields.push('left_at = ?');
            values.push(data.left_at);
        }

        if (fields.length > 0) {
            values.push(classId, studentProgramId);
            await this.db.query(
                `UPDATE class_students SET ${fields.join(', ')} WHERE class_id = ? AND student_program_id = ?;`,
                values,
            );
        }

        return await this.findMembership(classId, studentProgramId);
    }

    async remove(classId: number, studentProgramId: number): Promise<void> {
        await this.db.query(
            `DELETE FROM class_students WHERE class_id = ? AND student_program_id = ?;`,
            [classId, studentProgramId],
        );
    }

    async studentProgramExists(studentProgramId: number): Promise<boolean> {
        const result = await this.db.query(`SELECT 1 FROM student_programs WHERE id = ? LIMIT 1;`, [
            studentProgramId,
        ]);
        return result.rows.length > 0;
    }

    async getStudentProgram(studentProgramId: number): Promise<any> {
        const result = await this.db.query(
            `SELECT
                sp.id,
                sp.student_id,
                sp.branch_id,
                sp.status,
                sp.program_package_id,
                sp.program_level_id,
                pp.program_id AS package_program_id,
                pl.program_id AS level_program_id
             FROM student_programs sp
             LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
             LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
             WHERE sp.id = ? LIMIT 1;`,
            [studentProgramId],
        );
        return result.rows[0] ?? null;
    }

    /**
     * Enrollments that may be added to a class: same branch, matching program
     * (and level when the class targets one), still active, and not already an
     * active member. Quota usage is included for the UI.
     */
    async findEligibleStudents(params: {
        classId: number;
        branchId: number;
        programId?: number | null;
        levelId?: number | null;
    }): Promise<any[]> {
        const conditions: string[] = ['sp.branch_id = ?', "sp.status IN ('ACTIVE', 'TRIAL')"];
        const values: unknown[] = [params.branchId];

        if (params.programId) {
            conditions.push('(pp.program_id = ? OR pl.program_id = ?)');
            values.push(params.programId, params.programId);
        }
        if (params.levelId) {
            conditions.push('sp.program_level_id = ?');
            values.push(params.levelId);
        }

        conditions.push(
            `NOT EXISTS (
                SELECT 1 FROM class_students cs
                WHERE cs.class_id = ? AND cs.student_program_id = sp.id AND cs.left_at IS NULL
            )`,
        );
        values.push(params.classId);

        const result = await this.db.query(
            `SELECT
                sp.id,
                sp.student_id,
                s.full_name AS student_name,
                sp.branch_id,
                b.name AS branch_name,
                sp.status AS enrollment_status,
                pp.name AS package_name,
                pp.program_id AS package_program_id,
                pl.name AS level_name,
                sp.program_level_id,
                sp.total_sessions,
                sp.sessions_per_period,
                sp.session_period,
                COALESCE(used.used, 0) AS used
             FROM student_programs sp
             JOIN students s ON sp.student_id = s.id
             LEFT JOIN branches b ON sp.branch_id = b.id
             LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
             LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
             LEFT JOIN (
                 SELECT student_program_id,
                        SUM(CASE WHEN attendance_status <> 'RESCHEDULED' THEN 1 ELSE 0 END) AS used
                 FROM class_session_students
                 GROUP BY student_program_id
             ) used ON used.student_program_id = sp.id
             WHERE ${conditions.join(' AND ')}
             ORDER BY s.full_name ASC;`,
            values,
        );
        return result.rows;
    }

    async isActiveMember(classId: number, studentProgramId: number): Promise<boolean> {
        const result = await this.db.query(
            `SELECT 1 FROM class_students WHERE class_id = ? AND student_program_id = ? AND left_at IS NULL LIMIT 1;`,
            [classId, studentProgramId],
        );
        return result.rows.length > 0;
    }
}
