export const userOpenApi = {
    paths: {
        '/users': {
            get: {
                tags: ['User Management'],
                summary: 'List users with filtering and pagination',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'role', in: 'query', schema: { type: 'string' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                ],
                responses: {
                    '200': {
                        description: 'List of users',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/UserResponse' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['User Management'],
                summary: 'Create a new user',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateUserRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'User created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/users/{slug}': {
            get: {
                tags: ['User Management'],
                summary: 'Get user by slug',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'User details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserResponse' },
                            },
                        },
                    },
                    '404': { description: 'User not found' },
                },
            },
            delete: {
                tags: ['User Management'],
                summary: 'Delete user',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'User deleted' },
                    '404': { description: 'User not found' },
                },
            },
        },
        '/users/{id}': {
            patch: {
                tags: ['User Management'],
                summary: 'Update user',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateUserRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'User updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserResponse' },
                            },
                        },
                    },
                    '404': { description: 'User not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            UserResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    full_name: { type: 'string' },
                    slug: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', nullable: true },
                    avatar: { type: 'string', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateUserRequest: {
                type: 'object',
                required: ['full_name', 'email', 'password_hash'],
                properties: {
                    full_name: { type: 'string' },
                    email: { type: 'string' },
                    password_hash: { type: 'string' },
                    role: { type: 'string' },
                    avatar: { type: 'string' },
                },
            },
            UpdateUserRequest: {
                type: 'object',
                required: ['full_name', 'email'],
                properties: {
                    full_name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    avatar: { type: 'string' },
                },
            },
        },
    },
};
