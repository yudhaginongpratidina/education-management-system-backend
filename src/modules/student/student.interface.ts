export interface Student {
    id: number;
    full_name: string;
    address?: string;
    place_birth?: string;
    birth_date?: Date;
    school_level?: string;
    father_name?: string;
    mother_name?: string;
    guardian_name?: string;
    guardian_phone_number?: string;
    instagram?: string;
    information_source?: string;
    photos_of_children_may_be_posted: boolean;
    created_at: Date;
    updated_at: Date;

    // Joined program & branch details (if queried with programs)
    branch_id?: number;
    branch_name?: string;
    program_id?: number;
    program_name?: string;
    program_slug?: string;
    program_level_id?: number;
    level_name?: string;
    program_package_id?: number;
    package_name?: string;
    program_status?: string;
    student_programs?: any[];
}

export interface AssignStudentProgramDTO {
    student_ids: number[];
    branch_id: number;
    program_level_id: number;
    program_package_id?: number;
    program_slug?: string;
    status?: 'PENDING' | 'TRIAL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    started_at?: string;
    ended_at?: string;
    normal_price?: number;
    selling_price?: number;
    notes?: string;
}

export interface IStudentRepository {
    create(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student>;
    findAll(): Promise<Student[]>;
    findAllWithPrograms(): Promise<Student[]>;
    findById(id: number): Promise<Student | null>;
    findByFullName(full_name: string, excludeId?: number): Promise<Student | null>;
    update(
        id: number,
        data: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>,
    ): Promise<Student | null>;
    delete(id: number): Promise<void>;
    getPackage(packageId: number): Promise<any | null>;
    getDefaultPackageByProgramOrLevel(params: {
        program_package_id?: number;
        program_level_id?: number;
        program_slug?: string;
    }): Promise<any | null>;
    assignProgram(data: {
        student_id: number;
        branch_id: number;
        program_package_id: number;
        program_level_id: number;
        status: string;
        started_at?: string;
        ended_at?: string;
        normal_price: number;
        selling_price: number;
        notes?: string;
        duration_months?: number;
        sessions_per_period?: number;
        session_period?: string;
        total_sessions?: number;
    }): Promise<any>;
}
