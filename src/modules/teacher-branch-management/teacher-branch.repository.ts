import type { DatabaseClient } from '../../config/database/types';
import type { ITeacherBranchRepository } from './teacher-branch.interface';

export class TeacherBranchRepository implements ITeacherBranchRepository {
    constructor(private readonly db: DatabaseClient) {}

    async asign_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any> {
        const query = 'INSERT INTO teacher_branches (teacher_id, branch_id) VALUES (?, ?)';
        await this.db.query(query, [data.teacherId, data.branchId]);
        return { teacherId: data.teacherId, branchId: data.branchId };
    }

    async check_teacher_branch_exists(data: {
        teacherId: number;
        branchId: number;
    }): Promise<boolean> {
        const query =
            'SELECT 1 FROM teacher_branches WHERE teacher_id = ? AND branch_id = ? LIMIT 1';
        const result = await this.db.query(query, [data.teacherId, data.branchId]);
        return result.rows.length > 0;
    }

    async get_teacher_branch(data: { teacherId: number }): Promise<any> {
        const query = `
            SELECT tb.teacher_id, tb.branch_id, b.name as branch_name, b.slug as branch_slug
            FROM teacher_branches tb
            JOIN branches b ON tb.branch_id = b.id
            WHERE tb.teacher_id = ?
        `;
        const result = await this.db.query(query, [data.teacherId]);
        return result.rows;
    }

    async delete_teacher_branch(data: { teacherId: number; branchId: number }): Promise<any> {
        const query = 'DELETE FROM teacher_branches WHERE teacher_id = ? AND branch_id = ?';
        return await this.db.query(query, [data.teacherId, data.branchId]);
    }
}
