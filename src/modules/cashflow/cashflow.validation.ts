import { z } from 'zod';
import { dateSchema, idParam } from '../../shared/class/class.validation';

const filterQuery = z.object({
    date_from: dateSchema.optional(),
    date_to: dateSchema.optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    branch_id: z.coerce.number().int().positive().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
});

export const listCashflowSchema = z.object({ query: filterQuery });
export const summaryCashflowSchema = z.object({ query: filterQuery });

export const createCashflowSchema = z.object({
    body: z.object({
        branch_id: z.number().int().positive().optional().nullable(),
        transaction_date: dateSchema,
        type: z.enum(['INCOME', 'EXPENSE']),
        category: z.string().max(100).optional().nullable(),
        description: z.string().min(1, 'Keterangan wajib diisi').max(255),
        amount: z.number().positive('Nominal harus lebih dari 0'),
        payment_method: z.string().max(50).optional().nullable(),
        reference: z.string().max(100).optional().nullable(),
        notes: z.string().max(500).optional().nullable(),
    }),
});

export const updateCashflowSchema = z.object({
    params: z.object({ id: idParam }),
    body: z
        .object({
            branch_id: z.number().int().positive().optional().nullable(),
            transaction_date: dateSchema.optional(),
            type: z.enum(['INCOME', 'EXPENSE']).optional(),
            category: z.string().max(100).optional().nullable(),
            description: z.string().min(1).max(255).optional(),
            amount: z.number().positive().optional(),
            payment_method: z.string().max(50).optional().nullable(),
            reference: z.string().max(100).optional().nullable(),
            notes: z.string().max(500).optional().nullable(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field is required',
        }),
});

export const cashflowParamsSchema = z.object({
    params: z.object({ id: idParam }),
});
