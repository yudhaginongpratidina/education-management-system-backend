import { z } from 'zod';

export const assignTeacherBranchSchema = z.object({
    body: z.object({
        teacherId: z.number().int().positive(),
        branchId: z.number().int().positive(),
    }),
});
