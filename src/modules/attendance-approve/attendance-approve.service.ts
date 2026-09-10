import type {
    IAttendanceApproveRepository,
    IAttendanceApproveService,
} from './attendance-approve.interface';

export class AttendanceApproveService implements IAttendanceApproveService {
    constructor(private readonly repository: IAttendanceApproveRepository) {}

    async approve_attendance(data: {
        id: number;
        is_approved: boolean;
        notes?: string | null;
    }): Promise<any> {
        return await this.repository.approve_attendance(data);
    }

    async get_unapproved_attendances(branch_id: number): Promise<any[]> {
        return await this.repository.get_unapproved_attendances(branch_id);
    }
}
