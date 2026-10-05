// Enrollment eligibility rules shared by the class-session flows.
//
// - The session date must fall inside the package-driven enrollment period.
// - A student may only be scheduled for as many sessions as their package
//   grants (`total_sessions`). A `RESCHEDULED` row does NOT count against the
//   quota, which is what allows a reschedule (make-up) without consuming a new
//   session.
import { HttpError } from '../../core/errors/http.error';
import { toDateOnly } from './class.util';

export const assertWithinEnrollmentWindow = (enrollment: any, date: string): void => {
    const startedAt = toDateOnly(enrollment?.started_at);
    const endedAt = toDateOnly(enrollment?.ended_at);
    if ((startedAt && date < startedAt) || (endedAt && date > endedAt)) {
        throw new HttpError(
            409,
            'Sesi berada di luar periode paket siswa',
            'ENROLLMENT_WINDOW_EXCEEDED',
            true,
            { date, started_at: startedAt, ended_at: endedAt },
        );
    }
};

export const assertQuotaAvailable = (enrollment: any, usage: any): void => {
    const quota =
        enrollment?.total_sessions !== null && enrollment?.total_sessions !== undefined
            ? Number(enrollment.total_sessions)
            : null;

    // No configured quota → nothing to enforce (backwards compatible).
    if (quota === null || quota <= 0) return;

    const used = Number(usage?.used ?? 0);
    if (used >= quota) {
        throw new HttpError(
            409,
            `Kuota sesi program siswa sudah penuh (${used}/${quota} sesi). Gunakan reschedule untuk memindahkan sesi.`,
            'SESSION_QUOTA_EXCEEDED',
            true,
            { used, quota },
        );
    }
};
