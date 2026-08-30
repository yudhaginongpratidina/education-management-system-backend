import { z } from 'zod';

const availabilityBodySchema = z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
});

export const createAvailabilitySchema = z.object({
    body: availabilityBodySchema.extend({
        teacher_id: z.number(),
    }),
});

export const updateAvailabilitySchema = z.object({
    body: availabilityBodySchema,
    params: z.object({
        teacher_id: z.string().transform(Number),
    }),
});

export const getAvailabilitySchema = z.object({
    params: z.object({
        teacher_id: z.string().transform(Number),
    }),
});

export const deleteAvailabilitySchema = z.object({
    params: z.object({
        teacher_id: z.string().transform(Number),
    }),
});
