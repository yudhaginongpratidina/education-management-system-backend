import type {
    ISessionRescheduleRepository,
    ISessionRescheduleService,
    SessionRescheduleFilter,
} from './session-reschedule.interface';

export class SessionRescheduleService implements ISessionRescheduleService {
    constructor(private readonly repository: ISessionRescheduleRepository) {}

    async list(
        filter: SessionRescheduleFilter,
        pagination?: { limit: number; offset: number },
    ): Promise<any[]> {
        return await this.repository.findAll(filter, pagination);
    }
}
