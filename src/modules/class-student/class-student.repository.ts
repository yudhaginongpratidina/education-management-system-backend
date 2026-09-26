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
                sp.status as enrollment_status,
                s.full_name as student_name,
                pp.name as package_name,
                pl.name as level_name
            FROM class_students cs
            JOIN student_programs sp ON cs.student_program_id = sp.id
            JOIN students s ON sp.student_id = s.id
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
            `SELECT id, student_id, branch_id, status FROM student_programs WHERE id = ? LIMIT 1;`,
            [studentProgramId],
        );
        return result.rows[0] ?? null;
    }

    async isActiveMember(classId: number, studentProgramId: number): Promise<boolean> {
        const result = await this.db.query(
            `SELECT 1 FROM class_students WHERE class_id = ? AND student_program_id = ? AND left_at IS NULL LIMIT 1;`,
            [classId, studentProgramId],
        );
        return result.rows.length > 0;
    }
}
