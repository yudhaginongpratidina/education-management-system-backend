export const programOpenApi = {
    paths: {
        '/programs': {
            get: {
                tags: ['Program Management'],
                summary: 'List programs with filtering and pagination',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'name', in: 'query', schema: { type: 'string' } },
                    { name: 'slug', in: 'query', schema: { type: 'string' } },
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
                        description: 'List of programs',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/ProgramResponse' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Program Management'],
                summary: 'Create a new program',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateProgramRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Program created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgramResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/programs/{slug}': {
            get: {
                tags: ['Program Management'],
                summary: 'Get program by slug',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'Program details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgramResponse' },
                            },
                        },
                    },
                    '404': { description: 'Program not found' },
                },
            },
            patch: {
                tags: ['Program Management'],
                summary: 'Update program',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateProgramRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Program updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgramResponse' },
                            },
                        },
                    },
                    '404': { description: 'Program not found' },
                },
            },
            delete: {
                tags: ['Program Management'],
                summary: 'Delete program',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Program deleted' },
                    '404': { description: 'Program not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            ProgramResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    slug: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    requirements: { type: 'string', nullable: true },
                    price_per_session: { type: 'number' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateProgramRequest: {
                type: 'object',
                required: ['name', 'price_per_session'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    requirements: { type: 'string' },
                    price_per_session: { type: 'number' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
                },
            },
            UpdateProgramRequest: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    requirements: { type: 'string' },
                    price_per_session: { type: 'number' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
            },
        },
    },
};
