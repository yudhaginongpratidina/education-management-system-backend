import type { IStudentRepository, Student } from './student.interface';
import { HttpError } from '../../core/errors/http.error';
import { ErrorCodes } from '../../core/errors/error-codes';

export class StudentService {
    constructor(private readonly studentRepository: IStudentRepository) {}

    private async ensureNameIsUnique(full_name: string, excludeId?: number): Promise<void> {
        const existing = await this.studentRepository.findByFullName(full_name, excludeId);
        if (existing) {
            throw new HttpError(
                409,
                'Student with this name already exists',
                ErrorCodes.CONFLICT,
                true,
            );
        }
    }

    async createStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
        await this.ensureNameIsUnique(data.full_name);
        return await this.studentRepository.create(data);
    }

    async getAllStudents(): Promise<Student[]> {
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

    async exportStudents(): Promise<Student[]> {
        return await this.studentRepository.findAll();
    }

    async importStudents(
        students: Omit<Student, 'id' | 'created_at' | 'updated_at'>[],
    ): Promise<void> {
        // Validate all names before inserting anything so a failed import leaves no partial data.
        const seenNames = new Set<string>();
        for (const student of students) {
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

        for (const student of students) {
            await this.studentRepository.create(student);
        }
    }
}
