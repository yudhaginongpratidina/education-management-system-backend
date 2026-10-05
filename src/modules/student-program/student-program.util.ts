// Helpers to derive an enrollment period & meeting intensity from a program package.

export type SessionPeriod = 'WEEK' | 'MONTH' | 'DURATION';

// Add `months` to a YYYY-MM-DD date, clamping the day to the target month length.
export const addMonths = (date: string, months: number): string => {
    const [year, month, day] = date.split('-').map(Number);
    const base = new Date(Date.UTC(year, month - 1, day));
    const targetIndex = base.getUTCMonth() + Math.max(0, months);
    const targetYear = base.getUTCFullYear() + Math.floor(targetIndex / 12);
    const targetMonth = ((targetIndex % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)))
        .toISOString()
        .slice(0, 10);
};

// Inclusive end date: start + package duration (incl. bonus) minus one day.
export const computeEndedAt = (startedAt: string, totalMonths: number): string => {
    const end = new Date(`${addMonths(startedAt, totalMonths)}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() - 1);
    return end.toISOString().slice(0, 10);
};

// Number of sessions the package entitles the student to over its duration.
export const computeTotalSessions = (
    durationMonths: number,
    sessionsPerPeriod: number,
    sessionPeriod: SessionPeriod | null | undefined,
): number => {
    const months = Math.max(0, Number(durationMonths) || 0);
    const perPeriod = Math.max(0, Number(sessionsPerPeriod) || 0);
    if (months <= 0 || perPeriod <= 0) return 0;

    switch (sessionPeriod) {
        case 'MONTH':
            return months * perPeriod;
        case 'DURATION':
            return perPeriod;
        case 'WEEK':
        default: {
            const weeks = Math.max(1, Math.round((months * 30.4375) / 7));
            return weeks * perPeriod;
        }
    }
};

export const intensityLabel = (
    sessionsPerPeriod?: number | null,
    sessionPeriod?: SessionPeriod | null,
): string => {
    if (!sessionsPerPeriod) return '-';
    switch (sessionPeriod) {
        case 'MONTH':
            return `${sessionsPerPeriod}x per bulan`;
        case 'DURATION':
            return `${sessionsPerPeriod} sesi total`;
        case 'WEEK':
        default:
            return `${sessionsPerPeriod}x per minggu`;
    }
};
