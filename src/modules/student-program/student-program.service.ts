import type { IStudentProgramRepository, StudentProgram } from './student-program.interface';
import {
    computeEndedAt,
    computeTotalSessions,
    intensityLabel,
    type SessionPeriod,
} from './student-program.util';

type StudentProgramWriteData = Omit<
    StudentProgram,
    'id' | 'created_at' | 'updated_at' | 'student' | 'branch' | 'program_package' | 'program_level'
>;

// Normalise a DATE / ISO datetime / Date value to a YYYY-MM-DD string.
const toDateString = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
};

export class StudentProgramService {
    constructor(private readonly repository: IStudentProgramRepository) {}

    /**
     * The selected package decides the enrollment period (start → end) and the
     * meeting intensity. We snapshot those terms onto the enrollment so later
     * package edits do not silently change an existing schedule.
     */
    private async applyPackageTerms(
        data: Partial<StudentProgramWriteData>,
        fallbackStartedAt?: string,
    ): Promise<Partial<StudentProgramWriteData>> {
        const packageId = data.program_package_id;
        if (!packageId) return data;

        const pkg = await this.repository.getPackage(Number(packageId));
        if (!pkg) return data;

        const startedAt = toDateString(data.started_at) ?? fallbackStartedAt;
        const totalMonths =
            Number(pkg.duration_months ?? 0) + Number(pkg.bonus_duration_months ?? 0);
        const sessionsPerPeriod = Number(pkg.sessions_per_period ?? 0);
        const sessionPeriod = (pkg.session_period ?? null) as SessionPeriod | null;

        const next: Partial<StudentProgramWriteData> = {
            ...data,
            normal_price:
                data.normal_price !== undefined && data.normal_price !== null
                    ? data.normal_price
                    : Number(pkg.normal_price ?? 0),
            selling_price:
                data.selling_price !== undefined && data.selling_price !== null
                    ? data.selling_price
                    : Number(pkg.selling_price ?? 0),
            duration_months: totalMonths,
            sessions_per_period: sessionsPerPeriod,
            session_period: sessionPeriod,
            total_sessions: computeTotalSessions(totalMonths, sessionsPerPeriod, sessionPeriod),
        };

        if (startedAt && totalMonths > 0) {
            next.started_at = startedAt as any;
            next.ended_at = computeEndedAt(startedAt, totalMonths) as any;
        }

        return next;
    }

    async create(data: StudentProgramWriteData): Promise<StudentProgram> {
        const prepared = await this.applyPackageTerms(data);
        return await this.repository.create(prepared as StudentProgramWriteData);
    }

    async findAll(filter: any): Promise<StudentProgram[]> {
        return await this.repository.findAll(filter);
    }

    async findById(id: number): Promise<StudentProgram | null> {
        return await this.repository.findById(id);
    }

    async update(
        id: number,
        data: Partial<StudentProgramWriteData>,
    ): Promise<StudentProgram | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;

        const fallbackStartedAt =
            toDateString(data.started_at) ?? toDateString(existing.started_at);

        // Recompute whenever the package or the start date is (re)specified.
        const shouldRecompute =
            data.program_package_id !== undefined || data.started_at !== undefined;

        const prepared = shouldRecompute
            ? await this.applyPackageTerms(
                  {
                      ...data,
                      program_package_id: data.program_package_id ?? existing.program_package_id,
                  },
                  fallbackStartedAt,
              )
            : data;

        return await this.repository.update(id, prepared);
    }

    async delete(id: number): Promise<void> {
        return await this.repository.delete(id);
    }

    /**
     * Enrollment summary: package terms, period, intensity, and how many
     * sessions have been scheduled / attended / remain.
     */
    async getSummary(id: number): Promise<any | null> {
        const enrollment = await this.repository.findById(id);
        if (!enrollment) return null;

        const [usage, pkg] = await Promise.all([
            this.repository.getSessionUsage(id),
            this.repository.getPackage(enrollment.program_package_id),
        ]);

        const num = (value: unknown): number => Number(value ?? 0);
        const totalSessions = num(enrollment.total_sessions);
        const totalScheduled = num(usage.total_scheduled);
        const present = num(usage.present);

        return {
            ...enrollment,
            package: pkg
                ? {
                      id: pkg.id,
                      name: pkg.name,
                      duration_months: num(pkg.duration_months),
                      bonus_duration_months: num(pkg.bonus_duration_months),
                      sessions_per_period: num(pkg.sessions_per_period),
                      session_period: pkg.session_period,
                  }
                : null,
            intensity: {
                label: intensityLabel(
                    enrollment.sessions_per_period,
                    enrollment.session_period as SessionPeriod | null,
                ),
                sessions_per_period: num(enrollment.sessions_per_period),
                session_period: enrollment.session_period,
                duration_months: num(enrollment.duration_months),
            },
            period: {
                started_at: enrollment.started_at,
                ended_at: enrollment.ended_at,
            },
            usage: {
                total_sessions: totalSessions,
                total_scheduled: totalScheduled,
                attended: present,
                remaining: Math.max(totalSessions - totalScheduled, 0),
                used_percent:
                    totalSessions > 0
                        ? Math.min(Math.round((totalScheduled / totalSessions) * 100), 100)
                        : 0,
                by_status: {
                    present,
                    absent: num(usage.absent),
                    sick: num(usage.sick),
                    permission: num(usage.permission),
                    rescheduled: num(usage.rescheduled),
                },
            },
        };
    }
}
