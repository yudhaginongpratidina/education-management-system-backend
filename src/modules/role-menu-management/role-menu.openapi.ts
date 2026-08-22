export const roleMenuOpenApi = {
    paths: {
        '/role-menus/{role_slug}': {
            get: {
                tags: ['Role-Menu Management'],
                summary: 'Get all menus assigned to a role',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'role_slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'List of menus assigned to the role',
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
        },
        '/role-menus/{role_slug}/assign': {
            post: {
                tags: ['Role-Menu Management'],
                summary: 'Assign a menu to a role',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'role_slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AssignMenuRequest' },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Menu assigned' },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/role-menus/{role_slug}/sync': {
            post: {
                tags: ['Role-Menu Management'],
                summary: 'Sync menus for a role',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'role_slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SyncMenuRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Menus synced' },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/role-menus/{role_slug}/unassign/{menu_slug}': {
            delete: {
                tags: ['Role-Menu Management'],
                summary: 'Unassign a menu from a role',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'role_slug', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'menu_slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Menu unassigned' },
                    '404': { description: 'Resource not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            AssignMenuRequest: {
                type: 'object',
                required: ['menu_slug'],
                properties: {
                    menu_slug: { type: 'string' },
                },
            },
            SyncMenuRequest: {
                type: 'object',
                required: ['menu_slugs'],
                properties: {
                    menu_slugs: { type: 'array', items: { type: 'string' } },
                },
            },
        },
    },
};
