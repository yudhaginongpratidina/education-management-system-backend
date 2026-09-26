import type { IStudentProgramRepository, StudentProgram } from './student-program.interface';

export class StudentProgramService {
    constructor(private readonly repository: IStudentProgramRepository) {}

    async create(
        data: Omit<
            StudentProgram,
            | 'id'
            | 'created_at'
            | 'updated_at'
            | 'student'
            | 'branch'
            | 'program_package'
            | 'program_level'
        >,
    ): Promise<StudentProgram> {
        return await this.repository.create(data);
    }

    async findAll(filter: any): Promise<StudentProgram[]> {
        return await this.repository.findAll(filter);
    }

    async findById(id: number): Promise<StudentProgram | null> {
        return await this.repository.findById(id);
    }

    async update(
        id: number,
        data: Partial<
            Omit<
                StudentProgram,
                | 'id'
                | 'created_at'
                | 'updated_at'
                | 'student'
                | 'branch'
                | 'program_package'
                | 'program_level'
            >
        >,
    ): Promise<StudentProgram | null> {
        return await this.repository.update(id, data);
    }

    async delete(id: number): Promise<void> {
        return await this.repository.delete(id);
    }
}
