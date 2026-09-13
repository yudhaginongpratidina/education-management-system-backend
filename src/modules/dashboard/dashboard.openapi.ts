export const dashboardOpenApi = {
    paths: {
        '/dashboard/total-branch': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total branches',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total branches count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-teacher': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total teachers',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total teachers count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-program': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total programs',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total programs count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-role': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total roles',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total roles count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-menu': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total menus',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total menus count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-user': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total users',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total users count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
    },
};
