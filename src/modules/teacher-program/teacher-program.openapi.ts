export const teacherProgramOpenApi = {
    paths: {
        '/teacher-programs': {
            get: {
                tags: ['Teacher-Program'],
                summary: 'Get teacher-programs',
                parameters: [
                    { name: 'teacher_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'program_id', in: 'query', schema: { type: 'integer' } },
                ],
                responses: {
                    '200': {
                        description: 'Teacher-programs fetched',
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
                                                $ref: '#/components/schemas/TeacherProgramResponse',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Teacher-Program'],
                summary: 'Bulk create teacher-programs',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/TeacherProgramRequest' },
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Teacher-Program mapping created' },
                },
            },
            delete: {
                tags: ['Teacher-Program'],
                summary: 'Delete teacher-program mapping',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TeacherProgramRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Teacher-Program mapping deleted' },
                },
            },
        },
    },
    components: {
        schemas: {
            TeacherProgramRequest: {
                type: 'object',
                required: ['teacher_id', 'program_id'],
                properties: {
                    teacher_id: { type: 'integer' },
                    program_id: { type: 'integer' },
                },
            },
            TeacherProgramResponse: {
                type: 'object',
                properties: {
                    teacher_id: { type: 'integer' },
                    program_id: { type: 'integer' },
                    teacher_name: { type: 'string' },
                    teacher_slug: { type: 'string' },
                    program_name: { type: 'string' },
                    program_slug: { type: 'string' },
                },
            },
        },
    },
};
