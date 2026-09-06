export const branchOpenApi = {
    paths: {
        '/branches': {
            get: {
                tags: ['Branch Management'],
                summary: 'Get all branches or filter by parameters',
                description:
                    'Returns a list of branches. Optionally filter by id, name, or slug using query parameters.',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'query', schema: { type: 'integer' } },
                    { name: 'name', in: 'query', schema: { type: 'string' } },
                    { name: 'slug', in: 'query', schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'List of branches or filtered branch',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/BranchResponse' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Branch Management'],
                summary: 'Create a new branch',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/BranchRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Branch created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { $ref: '#/components/schemas/BranchResponse' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/branches/{slug}': {
            get: {
                tags: ['Branch Management'],
                summary: 'Get a branch by slug',
                description:
                    'Retrieve details for a specific branch using the slug as a path parameter.',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'Branch details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { $ref: '#/components/schemas/BranchResponse' },
                                    },
                                },
                            },
                        },
                    },
                    '404': { description: 'Branch not found' },
                },
            },
            delete: {
                tags: ['Branch Management'],
                summary: 'Delete a branch by slug',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Branch deleted' },
                    '404': { description: 'Branch not found' },
                },
            },
        },
        '/branches/{id}': {
            patch: {
                tags: ['Branch Management'],
                summary: 'Update a branch by id',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/BranchRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Branch updated',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { $ref: '#/components/schemas/BranchResponse' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            BranchRequest: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                    latitude: { type: 'string' },
                    longitude: { type: 'string' },
                    radius: { type: 'string' },
                },
            },
            BranchResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    address: { type: 'string' },
                    latitude: { type: 'string' },
                    longitude: { type: 'string' },
                    radius: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
};
