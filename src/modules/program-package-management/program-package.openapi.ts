export const programPackageOpenApi = {
    paths: {
        '/program-packages/{program_slug}': {
            get: {
                tags: ['Program-Package Management'],
                summary: 'List packages for a program',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'program_slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                    },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                ],
                responses: {
                    '200': {
                        description: 'List of packages',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/ProgramPackageResponse',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Program-Package Management'],
                summary: 'Create a new package for a program',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'program_slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateProgramPackageRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Package created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgramPackageResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/program-packages/{slug}': {
            patch: {
                tags: ['Program-Package Management'],
                summary: 'Update package',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateProgramPackageRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Package updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgramPackageResponse' },
                            },
                        },
                    },
                    '404': { description: 'Package not found' },
                },
            },
        },
        '/program-packages/{program_slug}/{slug}': {
            delete: {
                tags: ['Program-Package Management'],
                summary: 'Delete package',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'program_slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Package deleted' },
                    '404': { description: 'Package not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            ProgramPackageResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    program_id: { type: 'integer' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    duration_months: { type: 'integer' },
                    sessions_per_period: { type: 'integer' },
                    session_period: { type: 'string', enum: ['WEEK', 'MONTH', 'DURATION'] },
                    normal_price: { type: 'number' },
                    selling_price: { type: 'number' },
                    bonus_duration_months: { type: 'integer' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateProgramPackageRequest: {
                type: 'object',
                required: [
                    'name',
                    'duration_months',
                    'sessions_per_period',
                    'session_period',
                    'normal_price',
                    'selling_price',
                ],
                properties: {
                    name: { type: 'string' },
                    duration_months: { type: 'integer' },
                    sessions_per_period: { type: 'integer' },
                    session_period: { type: 'string', enum: ['WEEK', 'MONTH', 'DURATION'] },
                    normal_price: { type: 'number' },
                    selling_price: { type: 'number' },
                    bonus_duration_months: { type: 'integer' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
                },
            },
            UpdateProgramPackageRequest: {
                type: 'object',
                required: ['program_slug'],
                properties: {
                    program_slug: { type: 'string' },
                    name: { type: 'string' },
                    duration_months: { type: 'integer' },
                    sessions_per_period: { type: 'integer' },
                    session_period: { type: 'string', enum: ['WEEK', 'MONTH', 'DURATION'] },
                    normal_price: { type: 'number' },
                    selling_price: { type: 'number' },
                    bonus_duration_months: { type: 'integer' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
            },
        },
    },
};
