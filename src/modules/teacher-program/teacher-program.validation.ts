import { z } from 'zod';

export const createTeacherProgramSchema = z.object({
    body: z.array(
        z.object({
            teacher_id: z.number().int().positive(),
            program_id: z.number().int().positive(),
        }),
    ),
});

export const deleteTeacherProgramSchema = z.object({
    body: z.object({
        teacher_id: z.number().int().positive(),
        program_id: z.number().int().positive(),
    }),
});
