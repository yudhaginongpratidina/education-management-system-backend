export const teacherBranchOpenApi = {
    paths: {
        '/teacher-branches': {
            post: {
                tags: ['Teacher Branch Management'],
                summary: 'Assign a teacher to a branch',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['teacherId', 'branchId'],
                                properties: {
                                    teacherId: { type: 'integer' },
                                    branchId: { type: 'integer' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Teacher assigned to branch',
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
                                                teacherId: { type: 'integer' },
                                                branchId: { type: 'integer' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/teacher-branches/{teacherId}': {
            get: {
                tags: ['Teacher Branch Management'],
                summary: 'Get branches assigned to a teacher',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacherId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    '200': {
                        description: 'List of branches assigned to the teacher',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    teacher_id: { type: 'integer' },
                                                    branch_id: { type: 'integer' },
                                                    branch_name: { type: 'string' },
                                                    branch_slug: { type: 'string' },
                                                    latitude: { type: 'number' },
                                                    longitude: { type: 'number' },
                                                    radius: { type: 'number' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/teacher-branches/{teacherId}/{branchId}': {
            delete: {
                tags: ['Teacher Branch Management'],
                summary: 'Remove a teacher from a branch',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacherId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'branchId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    '200': {
                        description: 'Teacher removed from branch',
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
    },
    components: {
        schemas: {},
    },
};
