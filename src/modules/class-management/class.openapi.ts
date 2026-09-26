import { classAuthErrors } from '../../shared/class/class.openapi';

export const classOpenApi = {
    paths: {
        // ============================================================
        // CLASSES
        // ============================================================
        '/classes': {
            get: {
                tags: ['Classes'],
                summary: 'List classes',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { $ref: '#/components/schemas/ClassStatus' },
                    },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    {
                        name: 'sort_by',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['name', 'code', 'status', 'created_at', 'updated_at'],
                        },
                    },
                    {
                        name: 'sort_order',
                        in: 'query',
                        schema: { type: 'string', enum: ['ASC', 'DESC'] },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Classes fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Class' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                },
            },
            post: {
                tags: ['Classes'],
                summary: 'Create a class',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateClassRequest' },
                            example: {
                                branch_id: 1,
                                name: 'Tahsin Class A',
                                code: 'THS-A-2026',
                                description: 'Regular tahsin class for beginners',
                                status: 'ACTIVE',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Class created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { $ref: '#/components/schemas/Class' },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                },
            },
        },
        '/classes/{id}': {
            get: {
                tags: ['Classes'],
                summary: 'Get a class by ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassId' }],
                responses: {
                    '200': {
                        description: 'Class fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { $ref: '#/components/schemas/Class' },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND' },
                },
            },
            put: {
                tags: ['Classes'],
                summary: 'Update a class',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassId' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateClassRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Class updated',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { $ref: '#/components/schemas/Class' },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND' },
                },
            },
            delete: {
                tags: ['Classes'],
                summary: 'Delete a class',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassId' }],
                responses: {
                    '200': { description: 'Class deleted' },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND / CLASS_HAS_DEPENDENCIES' },
                },
            },
        },
    },

    components: {
        parameters: {},
        schemas: {
            Class: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Tahsin Class A' },
                    code: { type: 'string', example: 'THS-A-2026' },
                    description: { type: 'string', nullable: true },
                    status: { $ref: '#/components/schemas/ClassStatus' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateClassRequest: {
                type: 'object',
                required: ['branch_id', 'name', 'code'],
                properties: {
                    branch_id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Tahsin Class A' },
                    code: { type: 'string', example: 'THS-A-2026' },
                    description: { type: 'string', nullable: true },
                    status: { $ref: '#/components/schemas/ClassStatus' },
                },
            },
            UpdateClassRequest: {
                type: 'object',
                properties: {
                    branch_id: { type: 'integer' },
                    name: { type: 'string' },
                    code: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    status: { $ref: '#/components/schemas/ClassStatus' },
                },
            },
        },
    },
};
