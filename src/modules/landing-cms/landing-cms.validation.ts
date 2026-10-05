import { z } from 'zod';
import { LANDING_SECTION_KEYS } from './landing-cms.interface';

const sectionKeySchema = z.enum([...LANDING_SECTION_KEYS] as [string, ...string[]]);

// A section is either a single object (hero, about, pricing, ...) or a list
// (trust, features, testimonials, ...). The exact shape is validated by the
// frontend editor, the API only guarantees JSON object/array.
const sectionContentSchema = z.union([z.record(z.string(), z.any()), z.array(z.any())]);

export const sectionKeyParamsSchema = z.object({
    params: z.object({ key: sectionKeySchema }),
});

export const upsertSectionSchema = z.object({
    params: z.object({ key: sectionKeySchema }),
    body: z.object({
        content: sectionContentSchema,
        is_active: z.boolean().optional(),
    }),
});

export const bulkUpsertSectionsSchema = z.object({
    body: z.object({
        sections: z
            .array(
                z.object({
                    key: sectionKeySchema,
                    content: sectionContentSchema,
                    is_active: z.boolean().optional(),
                }),
            )
            .min(1, 'At least one section is required'),
    }),
});
