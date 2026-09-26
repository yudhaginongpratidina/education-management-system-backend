import type { DatabaseClient } from '../../config/database/types';
import type { ClassTeacherRole, QueryExecutor } from '../../shared/class/class.types';
import type { IClassTeacherRepository } from './class-teacher.interface';

export class ClassTeacherRepository implements IClassTeacherRepository {
    constructor(private readonly db: DatabaseClient) {}

    private executor(executor?: QueryExecutor): QueryExecutor {
        return executor ?? this.db;
    }

    async findByClass(classId: number): Promise<any> {
        const query = `
            SELECT
                ct.*,
                t.full_name as teacher_name,
                t.slug as teacher_slug
            FROM class_teachers ct
            JOIN teachers t ON ct.teacher_id = t.id
            WHERE ct.class_id = ?
            ORDER BY ct.started_at DESC, ct.id DESC
        `;
        const result = await this.db.query(query, [classId]);
        return result.rows;
    }

    async findById(id: number): Promise<any> {
        const result = await this.db.query(`SELECT * FROM class_teachers WHERE id = ? LIMIT 1;`, [
            id,
        ]);
        return result.rows[0] ?? null;
    }

    async create(
        data: {
            class_id: number;
            teacher_id: number;
            role: ClassTeacherRole;
            started_at: string;
            ended_at?: string | null;
        },
        executor?: QueryExecutor,
    ): Promise<any> {
        const query = `INSERT INTO class_teachers (class_id, teacher_id, role, started_at, ended_at) VALUES (?, ?, ?, ?, ?);`;
        await this.executor(executor).query(query, [
            data.class_id,
            data.teacher_id,
            data.role,
            data.started_at,
            data.ended_at ?? null,
        ]);

        const result = await this.executor(executor).query(
            `SELECT * FROM class_teachers WHERE id = LAST_INSERT_ID();`,
        );
        return result.rows[0];
    }

    async update(id: number, data: Record<string, unknown>): Promise<any> {
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
        await this.db.query(`UPDATE class_teachers SET ${fields.join(', ')} WHERE id = ?;`, values);
        return await this.findById(id);
    }

    async delete(id: number): Promise<void> {
        await this.db.query(`DELETE FROM class_teachers WHERE id = ?;`, [id]);
    }

    async teacherExists(teacherId: number): Promise<boolean> {
        const result = await this.db.query(`SELECT 1 FROM teachers WHERE id = ? LIMIT 1;`, [
            teacherId,
        ]);
        return result.rows.length > 0;
    }

    async isTeacherAssignedToBranch(teacherId: number, branchId: number): Promise<boolean> {
        const result = await this.db.query(
            `SELECT 1 FROM teacher_branches WHERE teacher_id = ? AND branch_id = ? LIMIT 1;`,
            [teacherId, branchId],
        );
        return result.rows.length > 0;
    }

    async findOverlappingAssignments(
        classId: number,
        startedAt: string,
        endedAt: string | null,
        role: ClassTeacherRole,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any> {
        const conditions = [
            'class_id = ?',
            'role = ?',
            "started_at <= COALESCE(?, '9999-12-31')",
            "COALESCE(ended_at, '9999-12-31') >= ?",
        ];
        const values: unknown[] = [classId, role, endedAt, startedAt];

        if (excludeId !== undefined) {
            conditions.push('id <> ?');
            values.push(excludeId);
        }

        const query = `SELECT * FROM class_teachers WHERE ${conditions.join(' AND ')} FOR UPDATE;`;
        const result = await this.executor(executor).query(query, values);
        return result.rows;
    }

    async findActiveAssignmentOnDate(
        classId: number,
        date: string,
        role: ClassTeacherRole,
        executor?: QueryExecutor,
    ): Promise<any> {
        const query = `
            SELECT * FROM class_teachers
            WHERE class_id = ? AND role = ?
              AND started_at <= ?
              AND (ended_at IS NULL OR ended_at >= ?)
            ORDER BY started_at DESC
            LIMIT 1
        `;
        const result = await this.executor(executor).query(query, [classId, role, date, date]);
        return result.rows[0] ?? null;
    }

    async findActiveAssignmentsForTeacher(
        classId: number,
        teacherId: number,
        date: string,
        executor?: QueryExecutor,
    ): Promise<any> {
        const query = `
            SELECT * FROM class_teachers
            WHERE class_id = ? AND teacher_id = ?
              AND started_at <= ?
              AND (ended_at IS NULL OR ended_at >= ?)
        `;
        const result = await this.executor(executor).query(query, [classId, teacherId, date, date]);
        return result.rows;
    }
}
