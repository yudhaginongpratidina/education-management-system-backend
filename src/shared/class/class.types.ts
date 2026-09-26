// Shared types for the class domain (classes, schedules, sessions, students, teachers).
import type { DatabaseClient, TransactionClient } from '../../config/database/types';

// A query executor can be either the default db client or a transaction client.
export type QueryExecutor = DatabaseClient | TransactionClient;

export type ClassStatus = 'ACTIVE' | 'INACTIVE';
export type ClassTeacherRole = 'PRIMARY' | 'SUBSTITUTE';
export type ClassSessionStatus =
    'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type SessionAttendanceStatus = 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMISSION' | 'RESCHEDULED';

export interface Pagination {
    limit: number;
    offset: number;
}
