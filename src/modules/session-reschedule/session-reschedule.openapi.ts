export const sessionRescheduleOpenApi = {
    paths: {
        '/session-reschedules': {
            get: {
                tags: ['Session Reschedule'],
                summary: 'List session / teacher / student reschedule history',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'type',
                        in: 'query',
                        schema: { type: 'string', enum: ['SESSION', 'TEACHER', 'STUDENT'] },
                    },
                    { name: 'class_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'student_program_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date' } },
                    { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
                ],
                responses: {
                    '200': {
                        description: 'Reschedules fetched',
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
                                                $ref: '#/components/schemas/SessionReschedule',
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
    },
    components: {
        parameters: {},
        schemas: {
            SessionReschedule: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    type: { type: 'string', enum: ['SESSION', 'TEACHER', 'STUDENT'] },
                    class_id: { type: 'integer', nullable: true },
                    class_name: { type: 'string', nullable: true },
                    student_program_id: { type: 'integer', nullable: true },
                    student_name: { type: 'string', nullable: true },
                    from_session_id: { type: 'integer', nullable: true },
                    to_session_id: { type: 'integer', nullable: true },
                    from_date: { type: 'string', format: 'date', nullable: true },
                    to_date: { type: 'string', format: 'date', nullable: true },
                    from_teacher_name: { type: 'string', nullable: true },
                    to_teacher_name: { type: 'string', nullable: true },
                    reason: { type: 'string', nullable: true },
                    created_by: { type: 'integer', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
};
