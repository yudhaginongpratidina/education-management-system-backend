import type { DatabaseClient } from '../../config/database/types';
import type {
    IStudentRepository,
    Student,
    StudentStatusHistory,
    StudentStatusType,
} from './student.interface';

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
        // Run automatic check on expired leaves first
        try {
            await this.checkAndAutoUpdateLeaveStatus();
        } catch {
            // Ignore error if table not ready
        }

        const query = `
            SELECT 
                s.*,
                (SELECT COUNT(*) FROM student_programs WHERE student_id = s.id) as total_programs,
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
                sp.status as program_status,
                sp.started_at,
                sp.ended_at,
                sp.last_active_at,
                sp.leave_until
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
        last_active_at?: string;
        leave_until?: string;
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
                status, started_at, ended_at, last_active_at, leave_until, normal_price, selling_price, notes,
                duration_months, sessions_per_period, session_period, total_sessions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await this.db.query(query, [
            data.student_id,
            data.branch_id,
            data.program_package_id,
            data.program_level_id,
            data.status,
            data.started_at ?? null,
            data.ended_at ?? null,
            data.last_active_at ?? null,
            data.leave_until ?? null,
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

    async getStatusHistory(studentId: number): Promise<StudentStatusHistory[]> {
        // Run auto check first
        try {
            await this.checkAndAutoUpdateLeaveStatus();
        } catch {
            // Ignore if check fails
        }

        const query = `
            SELECT 
                ssh.*,
                b.name as branch_name,
                p.name as program_name,
                pl.name as level_name
            FROM student_status_history ssh
            LEFT JOIN student_programs sp ON ssh.student_program_id = sp.id
            LEFT JOIN branches b ON sp.branch_id = b.id
            LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
            LEFT JOIN programs p ON pp.program_id = p.id
            LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
            WHERE ssh.student_id = ?
            ORDER BY ssh.start_date DESC, ssh.id DESC;
        `;
        const result = await this.db.query(query, [studentId]);
        return result.rows;
    }

    async addStatusHistory(data: {
        student_id: number;
        student_program_id?: number | null;
        status: StudentStatusType;
        start_date: string;
        end_date?: string | null;
        reason?: string | null;
        change_type?: 'MANUAL' | 'AUTOMATIC';
        notes?: string | null;
        created_by?: number | null;
    }): Promise<StudentStatusHistory> {
        const query = `
            INSERT INTO student_status_history (
                student_id, student_program_id, status, start_date, end_date,
                reason, change_type, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await this.db.query(query, [
            data.student_id,
            data.student_program_id ?? null,
            data.status,
            data.start_date,
            data.end_date ?? null,
            data.reason ?? null,
            data.change_type ?? 'MANUAL',
            data.notes ?? null,
            data.created_by ?? null,
        ]);

        const selectQuery = `SELECT * FROM student_status_history WHERE id = LAST_INSERT_ID();`;
        const selectResult = await this.db.query(selectQuery, []);

        // Synchronize ALL ongoing student_programs records for this student
        const lastActiveAt =
            data.status === 'ACTIVE'
                ? data.start_date || new Date().toISOString().slice(0, 10)
                : data.end_date || data.start_date;

        const leaveUntil = data.status === 'ON_LEAVE' ? (data.end_date ?? null) : null;

        if (data.status === 'ACTIVE') {
            await this.db.query(
                `UPDATE student_programs 
                 SET status = 'ACTIVE', 
                     leave_until = NULL,
                     last_active_at = COALESCE(?, last_active_at),
                     updated_at = NOW()
                 WHERE student_id = ? 
                   AND status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED');`,
                [data.start_date, data.student_id],
            );
        } else if (data.status === 'ON_LEAVE') {
            await this.db.query(
                `UPDATE student_programs 
                 SET status = 'ON_LEAVE', 
                     leave_until = ?,
                     last_active_at = COALESCE(?, last_active_at),
                     updated_at = NOW()
                 WHERE student_id = ? 
                   AND status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED');`,
                [leaveUntil, lastActiveAt, data.student_id],
            );

            // Automatically set open/scheduled session attendances to PERMISSION (Izin) for this student
            await this.db.query(
                `UPDATE class_session_students css
                 JOIN class_sessions cs ON css.session_id = cs.id
                 JOIN student_programs sp ON css.student_program_id = sp.id
                 SET css.attendance_status = 'PERMISSION',
                     css.notes = COALESCE(NULLIF(css.notes, ''), 'Siswa Sedang Cuti')
                 WHERE sp.student_id = ?
                   AND css.attendance_status = 'ABSENT'
                   AND cs.status NOT IN ('COMPLETED', 'CANCELLED');`,
                [data.student_id],
            );
        } else if (data.status === 'INACTIVE') {
            await this.db.query(
                `UPDATE student_programs 
                 SET status = 'INACTIVE', 
                     leave_until = NULL,
                     last_active_at = COALESCE(?, last_active_at),
                     updated_at = NOW()
                 WHERE student_id = ? 
                   AND status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED');`,
                [lastActiveAt, data.student_id],
            );
        } else {
            await this.db.query(
                `UPDATE student_programs 
                 SET status = ?, 
                     last_active_at = COALESCE(?, last_active_at),
                     leave_until = ?,
                     updated_at = NOW()
                 WHERE student_id = ? 
                   AND status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED');`,
                [data.status, lastActiveAt, leaveUntil, data.student_id],
            );
        }

        return selectResult.rows[0];
    }

    async deleteStatusHistory(studentId: number, historyId: number): Promise<void> {
        await this.db.query(`DELETE FROM student_status_history WHERE id = ? AND student_id = ?;`, [
            historyId,
            studentId,
        ]);
    }

    async getExportData(filters: { studentId?: number; branchId?: number } = {}): Promise<{
        students: any[];
        programs: any[];
        histories: any[];
        branchName?: string;
        studentName?: string;
    }> {
        // Run automatic check on expired leaves first
        try {
            await this.checkAndAutoUpdateLeaveStatus();
        } catch {
            // Ignore error
        }

        let branchName: string | undefined;
        let studentName: string | undefined;

        if (filters.branchId) {
            const bRes = await this.db.query('SELECT name FROM branches WHERE id = ? LIMIT 1;', [
                filters.branchId,
            ]);
            if (bRes.rows.length > 0) branchName = bRes.rows[0].name;
        }

        if (filters.studentId) {
            const sRes = await this.db.query('SELECT full_name FROM students WHERE id = ? LIMIT 1;', [
                filters.studentId,
            ]);
            if (sRes.rows.length > 0) studentName = sRes.rows[0].full_name;
        }

        // 1. Students Query
        const studentConditions: string[] = [];
        const studentValues: unknown[] = [];

        if (filters.studentId) {
            studentConditions.push('s.id = ?');
            studentValues.push(filters.studentId);
        } else if (filters.branchId) {
            studentConditions.push(
                'EXISTS (SELECT 1 FROM student_programs sp_chk WHERE sp_chk.student_id = s.id AND sp_chk.branch_id = ?)',
            );
            studentValues.push(filters.branchId);
        }

        const studentWhere =
            studentConditions.length > 0 ? `WHERE ${studentConditions.join(' AND ')}` : '';
        const studentQuery = `
            SELECT 
                s.*,
                b.name as branch_name,
                sp.branch_id,
                sp.status as program_status,
                (
                    SELECT GROUP_CONCAT(CONCAT(pp_sub.name, ' (', COALESCE(pl_sub.name, '-'), ')') SEPARATOR ', ')
                    FROM student_programs sp_sub
                    LEFT JOIN program_packages pp_sub ON sp_sub.program_package_id = pp_sub.id
                    LEFT JOIN program_levels pl_sub ON sp_sub.program_level_id = pl_sub.id
                    WHERE sp_sub.student_id = s.id
                ) as enrolled_programs_text
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
            ${studentWhere}
            ORDER BY s.full_name ASC;
        `;
        const studentsResult = await this.db.query(studentQuery, studentValues);

        // 2. Programs Query
        const programConditions: string[] = [];
        const programValues: unknown[] = [];

        if (filters.studentId) {
            programConditions.push('sp.student_id = ?');
            programValues.push(filters.studentId);
        } else if (filters.branchId) {
            programConditions.push('sp.branch_id = ?');
            programValues.push(filters.branchId);
        }

        const programWhere =
            programConditions.length > 0 ? `WHERE ${programConditions.join(' AND ')}` : '';
        const programQuery = `
            SELECT
                sp.*,
                s.full_name as student_name,
                b.name as branch_name,
                pp.name as package_name,
                p.name as program_name,
                pl.name as level_name
            FROM student_programs sp
            JOIN students s ON sp.student_id = s.id
            LEFT JOIN branches b ON sp.branch_id = b.id
            LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
            LEFT JOIN programs p ON pp.program_id = p.id
            LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
            ${programWhere}
            ORDER BY s.full_name ASC, sp.id DESC;
        `;
        const programsResult = await this.db.query(programQuery, programValues);

        // 3. Status History Query
        const historyConditions: string[] = [];
        const historyValues: unknown[] = [];

        if (filters.studentId) {
            historyConditions.push('ssh.student_id = ?');
            historyValues.push(filters.studentId);
        } else if (filters.branchId) {
            historyConditions.push(
                '(sp.branch_id = ? OR (ssh.student_program_id IS NULL AND EXISTS (SELECT 1 FROM student_programs sp_b WHERE sp_b.student_id = ssh.student_id AND sp_b.branch_id = ?)))',
            );
            historyValues.push(filters.branchId, filters.branchId);
        }

        const historyWhere =
            historyConditions.length > 0 ? `WHERE ${historyConditions.join(' AND ')}` : '';
        const historyQuery = `
            SELECT
                ssh.*,
                s.full_name as student_name,
                b.name as branch_name,
                pp.name as package_name,
                p.name as program_name,
                pl.name as level_name
            FROM student_status_history ssh
            JOIN students s ON ssh.student_id = s.id
            LEFT JOIN student_programs sp ON ssh.student_program_id = sp.id
            LEFT JOIN branches b ON sp.branch_id = b.id
            LEFT JOIN program_packages pp ON sp.program_package_id = pp.id
            LEFT JOIN programs p ON pp.program_id = p.id
            LEFT JOIN program_levels pl ON sp.program_level_id = pl.id
            ${historyWhere}
            ORDER BY s.full_name ASC, ssh.start_date DESC, ssh.id DESC;
        `;
        const historiesResult = await this.db.query(historyQuery, historyValues);

        return {
            students: studentsResult.rows,
            programs: programsResult.rows,
            histories: historiesResult.rows,
            branchName,
            studentName,
        };
    }

    async checkAndAutoUpdateLeaveStatus(): Promise<void> {
        const todayStr = new Date().toISOString().slice(0, 10);
        const expiredLeaves = await this.db.query(
            `SELECT DISTINCT student_id, leave_until FROM student_programs 
             WHERE status = 'ON_LEAVE' AND leave_until IS NOT NULL AND leave_until < ?;`,
            [todayStr],
        );

        for (const row of expiredLeaves.rows) {
            await this.db.query(
                `UPDATE student_programs 
                 SET status = 'ACTIVE', leave_until = NULL, updated_at = NOW() 
                 WHERE student_id = ? AND status = 'ON_LEAVE';`,
                [row.student_id],
            );
            await this.db.query(
                `INSERT INTO student_status_history (
                    student_id, student_program_id, status, start_date, reason, change_type, notes, created_at, updated_at
                ) VALUES (?, NULL, 'ACTIVE', ?, 'Selesai Masa Cuti (Otomatis Aktif Kembali)', 'AUTOMATIC', ?, NOW(), NOW());`,
                [
                    row.student_id,
                    todayStr,
                    `Masa cuti otomatis berakhir (sampai ${String(row.leave_until).slice(0, 10)}). Seluruh program siswa diaktifkan kembali.`,
                ],
            );
        }
    }
}
