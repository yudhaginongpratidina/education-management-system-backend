import type { IDashboardRepository, IDashboardService } from './dashboard.interface';

export class DashboardService implements IDashboardService {
    constructor(private readonly repo: IDashboardRepository) {}

    async get_total_branch(): Promise<any> {
        return await this.repo.get_total_branch();
    }

    async get_total_teacher(): Promise<any> {
        return await this.repo.get_total_teacher();
    }

    async get_total_program(): Promise<any> {
        return await this.repo.get_total_program();
    }

    async get_total_role(): Promise<any> {
        return await this.repo.get_total_role();
    }

    async get_total_menu(): Promise<any> {
        return await this.repo.get_total_menu();
    }

    async get_total_user(): Promise<any> {
        return await this.repo.get_total_user();
    }
}
