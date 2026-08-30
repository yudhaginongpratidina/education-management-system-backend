import type { Request, Response, NextFunction } from 'express';

export interface ITeacherAvailability {
    id: number;
    teacher_id: number;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ITeacherAvailabilityRepository {
    create_availability(
        data: Omit<ITeacherAvailability, 'id' | 'created_at' | 'updated_at'>,
    ): Promise<ITeacherAvailability>;
    get_availability(teacher_id: number): Promise<ITeacherAvailability | null>;
    update_availability(
        teacher_id: number,
        data: Omit<ITeacherAvailability, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>,
    ): Promise<void>;
    delete_availability(teacher_id: number): Promise<void>;
}

export interface ITeacherAvailabilityService {
    create_availability(
        data: Omit<ITeacherAvailability, 'id' | 'created_at' | 'updated_at'>,
    ): Promise<ITeacherAvailability>;
    get_availability(teacher_id: number): Promise<ITeacherAvailability>;
    update_availability(
        teacher_id: number,
        data: Omit<ITeacherAvailability, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>,
    ): Promise<void>;
    delete_availability(teacher_id: number): Promise<void>;
}

export interface ITeacherAvailablityController {
    create_availability(req: Request, res: Response, next: NextFunction): Promise<void>;
    get_availability(req: Request, res: Response, next: NextFunction): Promise<void>;
    update_availability(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete_availability(req: Request, res: Response, next: NextFunction): Promise<void>;
}
