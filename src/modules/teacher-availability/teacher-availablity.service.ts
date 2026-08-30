import { HttpError } from '../../core/errors/http.error';
import type {
    ITeacherAvailability,
    ITeacherAvailabilityRepository,
    ITeacherAvailabilityService,
} from './teacher-availablity.interface';

export class TeacherAvailabilityService implements ITeacherAvailabilityService {
    constructor(private readonly repo: ITeacherAvailabilityRepository) {}

    async create_availability(
        data: Omit<ITeacherAvailability, 'id' | 'created_at' | 'updated_at'>,
    ): Promise<ITeacherAvailability> {
        const existing = await this.repo.get_availability(data.teacher_id);
        if (existing)
            throw new HttpError(409, 'Availability already exists', 'AVAILABILITY_EXISTS', true);
        return await this.repo.create_availability(data);
    }

    async get_availability(teacher_id: number): Promise<ITeacherAvailability> {
        const availability = await this.repo.get_availability(teacher_id);
        if (!availability)
            throw new HttpError(404, 'Availability not found', 'AVAILABILITY_NOT_FOUND', true);
        return availability;
    }

    async update_availability(
        teacher_id: number,
        data: Omit<ITeacherAvailability, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>,
    ): Promise<void> {
        const availability = await this.repo.get_availability(teacher_id);
        if (!availability)
            throw new HttpError(404, 'Availability not found', 'AVAILABILITY_NOT_FOUND', true);
        await this.repo.update_availability(teacher_id, data);
    }

    async delete_availability(teacher_id: number): Promise<void> {
        const availability = await this.repo.get_availability(teacher_id);
        if (!availability)
            throw new HttpError(404, 'Availability not found', 'AVAILABILITY_NOT_FOUND', true);
        await this.repo.delete_availability(teacher_id);
    }
}
