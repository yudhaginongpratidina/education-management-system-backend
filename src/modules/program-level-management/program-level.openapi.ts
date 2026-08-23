export const programLevelOpenApi = {
    paths: {
        '/program-levels/{program_slug}': {
            get: {
                tags: ['Program-Level Management'],
                summary: 'List levels for a program',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'program_slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                    { name: 'level', in: 'query', schema: { type: 'integer' } },
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
                        description: 'List of levels',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/ProgramLevelResponse',
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
                tags: ['Program-Level Management'],
                summary: 'Create a new level for a program',
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
                            schema: { $ref: '#/components/schemas/CreateProgramLevelRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Level created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgramLevelResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/program-levels/{program_slug}/{level}': {
            patch: {
                tags: ['Program-Level Management'],
                summary: 'Update level',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'program_slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                    { name: 'level', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateProgramLevelRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Level updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgramLevelResponse' },
                            },
                        },
                    },
                    '404': { description: 'Level not found' },
                },
            },
            delete: {
                tags: ['Program-Level Management'],
                summary: 'Delete level',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'program_slug',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                    { name: 'level', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    '200': { description: 'Level deleted' },
                    '404': { description: 'Level not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            ProgramLevelResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    program_id: { type: 'integer' },
                    level: { type: 'integer' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateProgramLevelRequest: {
                type: 'object',
                required: ['level', 'name'],
                properties: {
                    level: { type: 'integer' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
                },
            },
            UpdateProgramLevelRequest: {
                type: 'object',
                properties: {
                    level: { type: 'integer' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
            },
        },
    },
};
