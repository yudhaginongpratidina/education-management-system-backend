import { LANDING_SECTION_KEYS } from './landing-cms.interface';

export const landingCmsOpenApi = {
    paths: {
        '/landing/content': {
            get: {
                tags: ['Landing CMS'],
                summary: 'Public landing page content',
                description:
                    'Returns every active landing section as a `{ section_key: content }` map. Consumed by the public landing page.',
                responses: {
                    '200': {
                        description: 'Landing content fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'object',
                                            additionalProperties: true,
                                            example: {
                                                hero: { badge: 'Bimbel modern' },
                                                faqs: [{ question: '...', answer: '...' }],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/landing/sections': {
            get: {
                tags: ['Landing CMS'],
                summary: 'List all landing sections (admin)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Landing sections fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/LandingSection' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
            put: {
                tags: ['Landing CMS'],
                summary: 'Bulk save landing sections (admin)',
                description: 'Upserts several sections at once. Used by the "Simpan" button.',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/BulkUpsertLandingSectionsRequest',
                            },
                            example: {
                                sections: [
                                    { key: 'hero', content: { badge: 'Bimbel modern' } },
                                    {
                                        key: 'faqs',
                                        content: [
                                            {
                                                question: 'Apakah ada kelas gratis?',
                                                answer: 'Ada.',
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Landing sections saved' },
                    '400': { description: 'VALIDATION_ERROR / CONTENT_REQUIRED' },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/landing/sections/reset': {
            post: {
                tags: ['Landing CMS'],
                summary: 'Delete all landing sections (admin reset)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Landing content reset' },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/landing/sections/{key}': {
            get: {
                tags: ['Landing CMS'],
                summary: 'Get a single landing section (admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/LandingSectionKeyParam' }],
                responses: {
                    '200': { description: 'Landing section fetched' },
                    '404': { description: 'SECTION_NOT_FOUND' },
                },
            },
            put: {
                tags: ['Landing CMS'],
                summary: 'Create or update a single landing section (admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/LandingSectionKeyParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpsertLandingSectionRequest' },
                            example: {
                                content: {
                                    badgeYear: '12',
                                    heading: 'Berawal dari satu ruang kelas',
                                },
                                is_active: true,
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Landing section saved' },
                    '400': { description: 'VALIDATION_ERROR / CONTENT_REQUIRED' },
                    '401': { description: 'Unauthorized' },
                },
            },
            delete: {
                tags: ['Landing CMS'],
                summary: 'Delete a single landing section (admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/LandingSectionKeyParam' }],
                responses: {
                    '200': { description: 'Landing section deleted' },
                    '404': { description: 'SECTION_NOT_FOUND' },
                },
            },
        },
    },

    components: {
        parameters: {
            LandingSectionKeyParam: {
                name: 'key',
                in: 'path',
                required: true,
                schema: { $ref: '#/components/schemas/LandingSectionKey' },
            },
        },
        schemas: {
            LandingSectionKey: {
                type: 'string',
                enum: [...LANDING_SECTION_KEYS],
                example: 'hero',
            },
            LandingSection: {
                type: 'object',
                properties: {
                    section_key: { $ref: '#/components/schemas/LandingSectionKey' },
                    content: {
                        description: 'Section content (JSON object or array).',
                        oneOf: [
                            { type: 'object', additionalProperties: true },
                            { type: 'array', items: {} },
                        ],
                    },
                    is_active: { type: 'boolean' },
                    updated_by: { type: 'integer', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            UpsertLandingSectionRequest: {
                type: 'object',
                required: ['content'],
                properties: {
                    content: {
                        oneOf: [
                            { type: 'object', additionalProperties: true },
                            { type: 'array', items: {} },
                        ],
                    },
                    is_active: { type: 'boolean', default: true },
                },
            },
            BulkUpsertLandingSectionsRequest: {
                type: 'object',
                required: ['sections'],
                properties: {
                    sections: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            required: ['key', 'content'],
                            properties: {
                                key: { $ref: '#/components/schemas/LandingSectionKey' },
                                content: {
                                    oneOf: [
                                        { type: 'object', additionalProperties: true },
                                        { type: 'array', items: {} },
                                    ],
                                },
                                is_active: { type: 'boolean', default: true },
                            },
                        },
                    },
                },
            },
        },
    },
};
