export const menuOpenApi = {
    paths: {
        '/menus': {
            get: {
                tags: ['Menu Management'],
                summary: 'List menus',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'parent_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'name', in: 'query', schema: { type: 'string' } },
                    { name: 'slug', in: 'query', schema: { type: 'string' } },
                    {
                        name: 'type',
                        in: 'query',
                        schema: { type: 'string', enum: ['GROUP', 'ITEM'] },
                    },
                    { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                ],
                responses: {
                    '200': {
                        description: 'List of menus',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/MenuResponse' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Menu Management'],
                summary: 'Create a new menu',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateMenuRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Menu created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MenuResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/menus/{slug}': {
            patch: {
                tags: ['Menu Management'],
                summary: 'Update menu',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateMenuRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Menu updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MenuResponse' },
                            },
                        },
                    },
                    '404': { description: 'Menu not found' },
                },
            },
            delete: {
                tags: ['Menu Management'],
                summary: 'Delete menu',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Menu deleted' },
                    '404': { description: 'Menu not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            MenuResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    parent_id: { type: 'integer', nullable: true },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    type: { type: 'string', enum: ['GROUP', 'ITEM'] },
                    icon: { type: 'string', nullable: true },
                    url: { type: 'string', nullable: true },
                    description: { type: 'string', nullable: true },
                    sort_order: { type: 'integer' },
                    is_active: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateMenuRequest: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                    parent_id: { type: 'integer', nullable: true },
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['GROUP', 'ITEM'] },
                    icon: { type: 'string' },
                    url: { type: 'string' },
                    description: { type: 'string' },
                    sort_order: { type: 'integer' },
                    is_active: { type: 'boolean' },
                },
            },
            UpdateMenuRequest: {
                type: 'object',
                properties: {
                    parent_id: { type: 'integer', nullable: true },
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['GROUP', 'ITEM'] },
                    icon: { type: 'string' },
                    url: { type: 'string' },
                    description: { type: 'string' },
                    sort_order: { type: 'integer' },
                    is_active: { type: 'boolean' },
                },
            },
        },
    },
};
