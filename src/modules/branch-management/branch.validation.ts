import { z } from 'zod';

const nullableString = z
    .string()
    .nullish()
    .transform((val) => (val === '' || val === undefined ? null : val));

export const createBranchSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        address: nullableString,
        latitude: nullableString,
        longitude: nullableString,
        radius: nullableString,
    }),
});

export const updateBranchSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        address: nullableString,
        latitude: nullableString,
        longitude: nullableString,
        radius: nullableString,
    }),
});
