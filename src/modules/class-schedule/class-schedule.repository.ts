import type { DatabaseClient } from '../../config/database/types';
import type { QueryExecutor } from '../../shared/class/class.types';
import type { IClassScheduleRepository } from './class-schedule.interface';

export class ClassScheduleRepository implements IClassScheduleRepository {
    constructor(private readonly db: DatabaseClient) {}

    private executor(executor?: QueryExecutor): QueryExecutor {
        return executor ?? this.db;
    }

    async findByClass(classId: number): Promise<any> {
        const query = `SELECT * FROM class_schedules WHERE class_id = ? ORDER BY day_of_week ASC, start_time ASC;`;
        const result = await this.db.query(query, [classId]);
        return result.rows;
    }

    async findById(id: number): Promise<any> {
        const result = await this.db.query(`SELECT * FROM class_schedules WHERE id = ? LIMIT 1;`, [
            id,
        ]);
        return result.rows[0] ?? null;
    }

    async create(
        data: {
            class_id: number;
            day_of_week: number;
            start_time: string;
            end_time: string;
            effective_from: string;
            effective_until?: string | null;
            is_active?: boolean;
        },
        executor?: QueryExecutor,
    ): Promise<any> {
        const query = `
            INSERT INTO class_schedules
                (class_id, day_of_week, start_time, end_time, effective_from, effective_until, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        await this.executor(executor).query(query, [
            data.class_id,
            data.day_of_week,
            data.start_time,
            data.end_time,
            data.effective_from,
            data.effective_until ?? null,
            data.is_active ?? true,
        ]);

        const result = await this.executor(executor).query(
            `SELECT * FROM class_schedules WHERE id = LAST_INSERT_ID();`,
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
        await this.db.query(
            `UPDATE class_schedules SET ${fields.join(', ')} WHERE id = ?;`,
            values,
        );
        return await this.findById(id);
    }

    async delete(id: number): Promise<void> {
        await this.db.query(`DELETE FROM class_schedules WHERE id = ?;`, [id]);
    }

    async findConflicts(
        classId: number,
        dayOfWeek: number,
        startTime: string,
        endTime: string,
        effectiveFrom: string,
        effectiveUntil: string | null,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any> {
        const conditions = [
            'class_id = ?',
            'day_of_week = ?',
            'start_time < ?',
            'end_time > ?',
            "effective_from <= COALESCE(?, '9999-12-31')",
            "COALESCE(effective_until, '9999-12-31') >= ?",
            'is_active = TRUE',
        ];
        const values: unknown[] = [
            classId,
            dayOfWeek,
            endTime,
            startTime,
            effectiveUntil,
            effectiveFrom,
        ];

        if (excludeId !== undefined) {
            conditions.push('id <> ?');
            values.push(excludeId);
        }

        const query = `SELECT * FROM class_schedules WHERE ${conditions.join(' AND ')} FOR UPDATE;`;
        const result = await this.executor(executor).query(query, values);
        return result.rows;
    }
}
