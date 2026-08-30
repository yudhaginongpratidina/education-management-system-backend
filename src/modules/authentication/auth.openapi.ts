export const authOpenApi = {
    paths: {
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Login user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                token: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/auth/me': {
            get: {
                tags: ['Authentication'],
                summary: 'Get current user',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'User details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'Logout user',
                responses: {
                    '200': {
                        description: 'Logout successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/auth/change-password': {
            patch: {
                tags: ['Authentication'],
                summary: 'Change user password',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Password changed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
    },
    components: {
        schemas: {
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                },
            },
            ChangePasswordRequest: {
                type: 'object',
                required: ['password'],
                properties: {
                    password: { type: 'string', format: 'password' },
                },
            },
        },
    },
};
