export const teacherOpenApi = {
    paths: {
        '/teachers': {
            post: {
                tags: ['Teacher Management'],
                summary: 'Create a new teacher',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateTeacherRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Teacher created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TeacherResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
            get: {
                tags: ['Teacher Management'],
                summary: 'List teachers with filtering',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'full_name', in: 'query', schema: { type: 'string' } },
                    { name: 'slug', in: 'query', schema: { type: 'string' } },
                    { name: 'phone_number', in: 'query', schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'List of teachers',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/TeacherResponse' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/teachers/{slug}': {
            patch: {
                tags: ['Teacher Management'],
                summary: 'Update teacher',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateTeacherRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Teacher updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TeacherResponse' },
                            },
                        },
                    },
                    '404': { description: 'Teacher not found' },
                },
            },
            delete: {
                tags: ['Teacher Management'],
                summary: 'Delete teacher',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Teacher deleted' },
                    '404': { description: 'Teacher not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            TeacherResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    full_name: { type: 'string' },
                    slug: { type: 'string' },
                    user_id: { type: 'string' },
                    phone_number: { type: 'string' },
                    address: { type: 'string' },
                    place_and_dob: { type: 'string' },
                    last_education: { type: 'string' },
                    position: { type: 'string' },
                    photo: { type: 'string' },
                    still_actively_working: { type: 'boolean' },
                },
            },
            CreateTeacherRequest: {
                type: 'object',
                required: ['full_name', 'email', 'phone_number'],
                properties: {
                    full_name: { type: 'string' },
                    email: { type: 'string' },
                    phone_number: { type: 'string' },
                    address: { type: 'string' },
                    place_and_dob: { type: 'string' },
                    last_education: { type: 'string' },
                    position: { type: 'string' },
                    photo: { type: 'string' },
                    still_actively_working: { type: 'boolean' },
                },
            },
            UpdateTeacherRequest: {
                type: 'object',
                properties: {
                    full_name: { type: 'string' },
                    user_id: { type: 'string' },
                    phone_number: { type: 'string' },
                    address: { type: 'string' },
                    place_and_dob: { type: 'string' },
                    last_education: { type: 'string' },
                    position: { type: 'string' },
                    photo: { type: 'string' },
                    still_actively_working: { type: 'boolean' },
                },
            },
        },
    },
};
