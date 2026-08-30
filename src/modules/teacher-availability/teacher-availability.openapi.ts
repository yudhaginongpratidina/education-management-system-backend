export const teacherAvailabilityOpenApi = {
    paths: {
        '/teacher-availability': {
            post: {
                tags: ['Teacher Availability Management'],
                summary: 'Create teacher availability',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateTeacherAvailabilityRequest',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Availability created',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/TeacherAvailabilityResponse',
                                },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                    '409': { description: 'Availability already exists' },
                },
            },
        },
        '/teacher-availability/{teacher_id}': {
            get: {
                tags: ['Teacher Availability Management'],
                summary: 'Get teacher availability',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacher_id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    '200': {
                        description: 'Availability details',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/TeacherAvailabilityResponse',
                                },
                            },
                        },
                    },
                    '404': { description: 'Availability not found' },
                },
            },
            patch: {
                tags: ['Teacher Availability Management'],
                summary: 'Update teacher availability',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacher_id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpdateTeacherAvailabilityRequest',
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Availability updated' },
                    '404': { description: 'Availability not found' },
                },
            },
            delete: {
                tags: ['Teacher Availability Management'],
                summary: 'Delete teacher availability',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacher_id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    '200': { description: 'Availability deleted' },
                    '404': { description: 'Availability not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            TeacherAvailabilityResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    teacher_id: { type: 'integer' },
                    monday: { type: 'boolean' },
                    tuesday: { type: 'boolean' },
                    wednesday: { type: 'boolean' },
                    thursday: { type: 'boolean' },
                    friday: { type: 'boolean' },
                    saturday: { type: 'boolean' },
                    sunday: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateTeacherAvailabilityRequest: {
                type: 'object',
                required: ['teacher_id'],
                properties: {
                    teacher_id: { type: 'integer' },
                    monday: { type: 'boolean' },
                    tuesday: { type: 'boolean' },
                    wednesday: { type: 'boolean' },
                    thursday: { type: 'boolean' },
                    friday: { type: 'boolean' },
                    saturday: { type: 'boolean' },
                    sunday: { type: 'boolean' },
                },
            },
            UpdateTeacherAvailabilityRequest: {
                type: 'object',
                properties: {
                    monday: { type: 'boolean' },
                    tuesday: { type: 'boolean' },
                    wednesday: { type: 'boolean' },
                    thursday: { type: 'boolean' },
                    friday: { type: 'boolean' },
                    saturday: { type: 'boolean' },
                    sunday: { type: 'boolean' },
                },
            },
        },
    },
};
