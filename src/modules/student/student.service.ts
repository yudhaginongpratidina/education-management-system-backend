import type { IStudentRepository, Student, AssignStudentProgramDTO } from './student.interface';
import { HttpError } from '../../core/errors/http.error';
import { ErrorCodes } from '../../core/errors/error-codes';
import { StudentExcelHelper, type ParsedStudentRow } from './student.excel';
import { computeEndedAt, computeTotalSessions, type SessionPeriod } from '../student-program/student-program.util';

export class StudentService {
    constructor(private readonly studentRepository: IStudentRepository) {}

    private async ensureNameIsUnique(full_name: string, excludeId?: number): Promise<void> {
        const existing = await this.studentRepository.findByFullName(full_name, excludeId);
        if (existing) {
            throw new HttpError(
                409,
                `Student with name "${full_name}" already exists`,
                ErrorCodes.CONFLICT,
                true,
            );
        }
    }

    async createStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
        await this.ensureNameIsUnique(data.full_name);
        return await this.studentRepository.create(data);
    }

    async getAllStudents(withPrograms = true): Promise<Student[]> {
        if (withPrograms) {
            return await this.studentRepository.findAllWithPrograms();
        }
        return await this.studentRepository.findAll();
    }

    async getStudentById(id: number): Promise<Student | null> {
        return await this.studentRepository.findById(id);
    }

    async updateStudent(
        id: number,
        data: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>,
    ): Promise<Student | null> {
        if (data.full_name !== undefined) {
            await this.ensureNameIsUnique(data.full_name, id);
        }
        return await this.studentRepository.update(id, data);
    }

    async deleteStudent(id: number): Promise<void> {
        return await this.studentRepository.delete(id);
    }

    async exportStudentsExcel(): Promise<Buffer> {
        const students = await this.studentRepository.findAll();
        return await StudentExcelHelper.generateExportExcel(students);
    }

    async getImportTemplateExcel(): Promise<Buffer> {
        return await StudentExcelHelper.generateTemplateExcel();
    }

    async previewImportExcel(buffer: Buffer): Promise<{
        total_rows: number;
        valid_rows: number;
        invalid_rows: number;
        data: ParsedStudentRow[];
    }> {
        const rawRows = await StudentExcelHelper.parseExcel(buffer);
        const existingStudents = await this.studentRepository.findAll();
        const existingNames = new Set(
            existingStudents.map((s) => s.full_name.trim().toLowerCase()),
        );

        const seenInFile = new Set<string>();
        const processedRows: ParsedStudentRow[] = [];

        for (const row of rawRows) {
            const errors: string[] = [];
            const normalizedName = row.full_name ? row.full_name.trim().toLowerCase() : '';

            if (!normalizedName) {
                errors.push('Nama lengkap wajib diisi');
            } else if (seenInFile.has(normalizedName)) {
                errors.push('Nama siswa duplikat di dalam file');
            } else if (existingNames.has(normalizedName)) {
                errors.push('Nama siswa sudah terdaftar di sistem');
            }

            let status: 'VALID' | 'INVALID' | 'DUPLICATE_NAME' = 'VALID';
            if (errors.length > 0) {
                status = errors.some((e) => e.includes('duplikat') || e.includes('terdaftar'))
                    ? 'DUPLICATE_NAME'
                    : 'INVALID';
            }

            if (normalizedName) {
                seenInFile.add(normalizedName);
            }

            processedRows.push({
                ...row,
                status,
                errors,
            });
        }

        const validCount = processedRows.filter((r) => r.status === 'VALID').length;
        const invalidCount = processedRows.length - validCount;

        return {
            total_rows: processedRows.length,
            valid_rows: validCount,
            invalid_rows: invalidCount,
            data: processedRows,
        };
    }

    async importStudents(
        students: Omit<Student, 'id' | 'created_at' | 'updated_at'>[],
    ): Promise<{ imported_count: number }> {
        const validStudents = students.filter(
            (s) => s.full_name && s.full_name.trim().length > 0,
        );

        const seenNames = new Set<string>();
        for (const student of validStudents) {
            const normalizedName = student.full_name.trim().toLowerCase();
            if (seenNames.has(normalizedName)) {
                throw new HttpError(
                    409,
                    `Duplicate student name in import: ${student.full_name}`,
                    ErrorCodes.CONFLICT,
                    true,
                );
            }
            seenNames.add(normalizedName);
            await this.ensureNameIsUnique(student.full_name);
        }

        let count = 0;
        for (const student of validStudents) {
            await this.studentRepository.create(student);
            count++;
        }

        return { imported_count: count };
    }

    async assignProgram(dto: AssignStudentProgramDTO): Promise<any[]> {
        if (!dto.student_ids || dto.student_ids.length === 0) {
            throw new HttpError(400, 'Minimal pilih satu siswa untuk di-assign', ErrorCodes.BAD_REQUEST, true);
        }

        const pkg = await this.studentRepository.getDefaultPackageByProgramOrLevel({
            program_package_id: dto.program_package_id,
            program_level_id: dto.program_level_id,
            program_slug: dto.program_slug,
        });

        if (!pkg && !dto.program_package_id) {
            throw new HttpError(400, 'Paket program tidak ditemukan untuk level yang dipilih', ErrorCodes.BAD_REQUEST, true);
        }

        const packageId = dto.program_package_id || pkg?.id;
        const totalMonths = pkg
            ? Number(pkg.duration_months ?? 0) + Number(pkg.bonus_duration_months ?? 0)
            : 1;
        const sessionsPerPeriod = pkg ? Number(pkg.sessions_per_period ?? 0) : 1;
        const sessionPeriod = (pkg?.session_period ?? 'MONTH') as SessionPeriod;
        const totalSessions = computeTotalSessions(totalMonths, sessionsPerPeriod, sessionPeriod);

        const todayStr = new Date().toISOString().slice(0, 10);
        const startedAt = dto.started_at ? String(dto.started_at).slice(0, 10) : todayStr;
        const endedAt = dto.ended_at
            ? String(dto.ended_at).slice(0, 10)
            : totalMonths > 0
              ? computeEndedAt(startedAt, totalMonths)
              : undefined;

        const normalPrice =
            dto.normal_price !== undefined ? Number(dto.normal_price) : Number(pkg?.normal_price ?? 0);
        const sellingPrice =
            dto.selling_price !== undefined ? Number(dto.selling_price) : Number(pkg?.selling_price ?? 0);

        const results: any[] = [];
        for (const studentId of dto.student_ids) {
            const assigned = await this.studentRepository.assignProgram({
                student_id: Number(studentId),
                branch_id: Number(dto.branch_id),
                program_package_id: Number(packageId),
                program_level_id: Number(dto.program_level_id),
                status: dto.status ?? 'ACTIVE',
                started_at: startedAt,
                ended_at: endedAt,
                normal_price: normalPrice,
                selling_price: sellingPrice,
                notes: dto.notes,
                duration_months: totalMonths,
                sessions_per_period: sessionsPerPeriod,
                session_period: sessionPeriod,
                total_sessions: totalSessions,
            });
            results.push(assigned);
        }

        return results;
    }
}
