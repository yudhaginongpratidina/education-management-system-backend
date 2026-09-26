import type { DatabaseClient } from '../../config/database/types';
import type { Pagination, QueryExecutor } from '../../shared/class/class.types';
import type { IClassSessionRepository, SessionListFilter } from './class-session.interface';

const ACTIVE_SESSION_STATUS = "('CANCELLED', 'RESCHEDULED')";

export class ClassSessionRepository implements IClassSessionRepository {
    constructor(private readonly db: DatabaseClient) {}

    private executor(executor?: QueryExecutor): QueryExecutor {
        return executor ?? this.db;
    }

    private buildFilters(filter: SessionListFilter): { sql: string; values: unknown[] } {
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (filter.class_id !== undefined) {
            conditions.push('cs.class_id = ?');
            values.push(filter.class_id);
        }
        if (filter.teacher_id !== undefined) {
            conditions.push('cs.teacher_id = ?');
            values.push(filter.teacher_id);
        }
        if (filter.branch_id !== undefined) {
            conditions.push('c.branch_id = ?');
            values.push(filter.branch_id);
        }
        if (filter.scheduled_date !== undefined) {
            conditions.push('cs.scheduled_date = ?');
            values.push(filter.scheduled_date);
        }
        if (filter.date_from !== undefined) {
            conditions.push('cs.scheduled_date >= ?');
            values.push(filter.date_from);
        }
        if (filter.date_to !== undefined) {
            conditions.push('cs.scheduled_date <= ?');
            values.push(filter.date_to);
        }
        if (filter.status !== undefined) {
            conditions.push('cs.status = ?');
            values.push(filter.status);
        }

        return {
            sql: conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '',
            values,
        };
    }

    async create(
        data: {
            class_id: number;
            scheduled_date: string;
            start_time: string;
            end_time: string;
            teacher_id: number;
            status?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
            notes?: string | null;
        },
        executor?: QueryExecutor,
    ): Promise<any> {
        const query = `
            INSERT INTO class_sessions
                (class_id, scheduled_date, start_time, end_time, teacher_id, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        await this.executor(executor).query(query, [
            data.class_id,
            data.scheduled_date,
            data.start_time,
            data.end_time,
            data.teacher_id,
            data.status ?? 'SCHEDULED',
            data.notes ?? null,
        ]);

        const result = await this.executor(executor).query(
            `SELECT * FROM class_sessions WHERE id = LAST_INSERT_ID();`,
        );
        return result.rows[0];
    }

    async findAll(filter: SessionListFilter, pagination?: Pagination): Promise<any> {
        const { sql, values } = this.buildFilters(filter);
        let query = `
            SELECT
                cs.*,
                c.name as class_name,
                c.code as class_code,
                c.branch_id,
                t.full_name as teacher_name
            FROM class_sessions cs
            JOIN classes c ON cs.class_id = c.id
            LEFT JOIN teachers t ON cs.teacher_id = t.id
            ${sql}
            ORDER BY cs.scheduled_date DESC, cs.start_time ASC
        `;

        if (pagination) {
            query += ` LIMIT ? OFFSET ?`;
            values.push(pagination.limit, pagination.offset);
        }

        const result = await this.db.query(query, values);
        return result.rows;
    }

    async findById(id: number, executor?: QueryExecutor): Promise<any> {
        const query = `
            SELECT
                cs.*,
                c.name as class_name,
                c.code as class_code,
                c.branch_id,
                t.full_name as teacher_name
            FROM class_sessions cs
            JOIN classes c ON cs.class_id = c.id
            LEFT JOIN teachers t ON cs.teacher_id = t.id
            WHERE cs.id = ?
            LIMIT 1
        `;
        const result = await this.executor(executor).query(query, [id]);
        return result.rows[0] ?? null;
    }

    async update(
        id: number,
        data: Record<string, unknown>,
        executor?: QueryExecutor,
    ): Promise<any> {
        const fields: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return await this.findById(id, executor);

        values.push(id);
        await this.executor(executor).query(
            `UPDATE class_sessions SET ${fields.join(', ')} WHERE id = ?;`,
            values,
        );
        return await this.findById(id, executor);
    }

    async delete(id: number): Promise<void> {
        await this.db.query(`DELETE FROM class_sessions WHERE id = ?;`, [id]);
    }

    async findClassConflicts(
        classId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any> {
        const conditions = [
            'class_id = ?',
            'scheduled_date = ?',
            'start_time < ?',
            'end_time > ?',
            `status NOT IN ${ACTIVE_SESSION_STATUS}`,
        ];
        const values: unknown[] = [classId, date, endTime, startTime];

        if (excludeId !== undefined) {
            conditions.push('id <> ?');
            values.push(excludeId);
        }

        const query = `SELECT * FROM class_sessions WHERE ${conditions.join(' AND ')} FOR UPDATE;`;
        const result = await this.executor(executor).query(query, values);
        return result.rows;
    }

    async findTeacherConflicts(
        teacherId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeId?: number,
        executor?: QueryExecutor,
    ): Promise<any> {
        const conditions = [
            'teacher_id = ?',
            'scheduled_date = ?',
            'start_time < ?',
            'end_time > ?',
            `status NOT IN ${ACTIVE_SESSION_STATUS}`,
        ];
        const values: unknown[] = [teacherId, date, endTime, startTime];

        if (excludeId !== undefined) {
            conditions.push('id <> ?');
            values.push(excludeId);
        }

        const query = `SELECT * FROM class_sessions WHERE ${conditions.join(' AND ')} FOR UPDATE;`;
        const result = await this.executor(executor).query(query, values);
        return result.rows;
    }

    async findExistingSession(
        classId: number,
        date: string,
        startTime: string,
        endTime: string,
        executor?: QueryExecutor,
    ): Promise<any> {
        const query = `
            SELECT * FROM class_sessions
            WHERE class_id = ? AND scheduled_date = ? AND start_time = ? AND end_time = ?
            LIMIT 1
            FOR UPDATE
        `;
        const result = await this.executor(executor).query(query, [
            classId,
            date,
            startTime,
            endTime,
        ]);
        return result.rows[0] ?? null;
    }

    async findByClassAndDate(classId: number, from: string, to: string): Promise<any> {
        return await this.findAll({ class_id: classId, date_from: from, date_to: to });
    }

    async findCalendar(filter: SessionListFilter): Promise<any> {
        const { sql, values } = this.buildFilters(filter);
        const query = `
            SELECT
                cs.id,
                c.name as title,
                cs.scheduled_date,
                cs.start_time,
                cs.end_time,
                cs.class_id,
                cs.teacher_id,
                c.branch_id,
                cs.status
            FROM class_sessions cs
            JOIN classes c ON cs.class_id = c.id
            ${sql}
            ORDER BY cs.scheduled_date ASC, cs.start_time ASC
        `;
        const result = await this.db.query(query, values);
        return result.rows;
    }
}
