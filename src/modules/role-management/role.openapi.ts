export const roleOpenApi = {
    paths: {
        '/roles': {
            get: {
                tags: ['Role Management'],
                summary: 'List roles',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'name', in: 'query', schema: { type: 'string' } },
                    { name: 'slug', in: 'query', schema: { type: 'string' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                ],
                responses: {
                    '200': {
                        description: 'List of roles',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/RoleResponse' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Role Management'],
                summary: 'Create a new role',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateRoleRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Role created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RoleResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/roles/{slug}': {
            patch: {
                tags: ['Role Management'],
                summary: 'Update role',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateRoleRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Role updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RoleResponse' },
                            },
                        },
                    },
                    '404': { description: 'Role not found' },
                },
            },
            delete: {
                tags: ['Role Management'],
                summary: 'Delete role',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Role deleted' },
                    '404': { description: 'Role not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            RoleResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateRoleRequest: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                },
            },
            UpdateRoleRequest: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                },
            },
        },
    },
};
