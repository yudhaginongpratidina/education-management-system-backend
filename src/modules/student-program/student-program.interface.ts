export interface StudentProgram {
    id: number;
    student_id: number;
    branch_id: number;
    program_package_id: number;
    program_level_id: number;
    status: 'PENDING' | 'TRIAL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    started_at?: Date;
    ended_at?: Date;
    normal_price: number;
    selling_price: number;
    notes?: string;
    // Snapshot of the chosen package terms (drives scheduling & reschedule).
    duration_months?: number | null;
    sessions_per_period?: number | null;
    session_period?: 'WEEK' | 'MONTH' | 'DURATION' | null;
    total_sessions?: number | null;
    created_at: Date;
    updated_at: Date;

    // Joined details
    student?: any;
    branch?: any;
    program_package?: any;
    program_level?: any;
}

export interface IStudentProgramRepository {
    create(
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
    ): Promise<StudentProgram>;
    findAll(filter?: any): Promise<StudentProgram[]>;
    findById(id: number): Promise<StudentProgram | null>;
    update(
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
    ): Promise<StudentProgram | null>;
    delete(id: number): Promise<void>;
    getPackage(packageId: number): Promise<any | null>;
    getSessionUsage(studentProgramId: number): Promise<any>;
}
