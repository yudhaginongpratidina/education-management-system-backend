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
}

export interface IStudentRepository {
    create(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student>;
    findAll(): Promise<Student[]>;
    findById(id: number): Promise<Student | null>;
    findByFullName(full_name: string, excludeId?: number): Promise<Student | null>;
    update(
        id: number,
        data: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>,
    ): Promise<Student | null>;
    delete(id: number): Promise<void>;
}
