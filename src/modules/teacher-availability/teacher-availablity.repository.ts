import type { DatabaseClient } from '../../config/database/types';
import type {
    ITeacherAvailability,
    ITeacherAvailabilityRepository,
} from './teacher-availablity.interface';

export class TeacherAvailabilityRepository implements ITeacherAvailabilityRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_availability(
        data: Omit<ITeacherAvailability, 'id' | 'created_at' | 'updated_at'>,
    ): Promise<ITeacherAvailability> {
        const query = `INSERT INTO teacher_availability (teacher_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
        const result = await this.db.query(query, [
            data.teacher_id,
            data.monday,
            data.tuesday,
            data.wednesday,
            data.thursday,
            data.friday,
            data.saturday,
            data.sunday,
        ]);
        return {
            id: (result as any).insertId,
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

    async get_availability(teacher_id: number): Promise<ITeacherAvailability | null> {
        const query = `SELECT * FROM teacher_availability WHERE teacher_id = ?;`;
        const result = await this.db.query(query, [teacher_id]);
        return result.rows[0] || null;
    }

    async update_availability(
        teacher_id: number,
        data: Omit<ITeacherAvailability, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>,
    ): Promise<void> {
        const query = `UPDATE teacher_availability SET monday = ?, tuesday = ?, wednesday = ?, thursday = ?, friday = ?, saturday = ?, sunday = ? WHERE teacher_id = ?;`;
        await this.db.query(query, [
            data.monday,
            data.tuesday,
            data.wednesday,
            data.thursday,
            data.friday,
            data.saturday,
            data.sunday,
            teacher_id,
        ]);
    }

    async delete_availability(teacher_id: number): Promise<void> {
        const query = `DELETE FROM teacher_availability WHERE teacher_id = ?;`;
        await this.db.query(query, [teacher_id]);
    }
}
