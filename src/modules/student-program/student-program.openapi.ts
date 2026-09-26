export const studentProgramOpenApi = {
    paths: {
        '/student-programs': {
            get: {
                tags: ['Student Program'],
                summary: 'Get all student programs',
                description:
                    'Returns a list of student programs, optionally filtered by status, student, or branch.',
                parameters: [
                    {
                        name: 'status',
                        in: 'query',
                        required: false,
                        description: 'Filter by enrollment status',
                        schema: { $ref: '#/components/schemas/StudentProgramStatus' },
                    },
                    {
                        name: 'student_id',
                        in: 'query',
                        required: false,
                        description: 'Filter by student ID',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'branch_id',
                        in: 'query',
                        required: false,
                        description: 'Filter by branch ID',
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'List of student programs',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/StudentProgram' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Student Program'],
                summary: 'Create a new student program',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateStudentProgramRequest' },
                            example: {
                                student_id: 1,
                                branch_id: 1,
                                program_package_id: 2,
                                program_level_id: 3,
                                status: 'PENDING',
                                started_at: '2026-01-05',
                                ended_at: '2026-06-05',
                                normal_price: 1500000,
                                selling_price: 1200000,
                                notes: 'Enrollment via Instagram promo',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Student program created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StudentProgram' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/student-programs/{id}': {
            get: {
                tags: ['Student Program'],
                summary: 'Get student program by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Student program found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StudentProgram' },
                            },
                        },
                    },
                    '404': { description: 'Student program not found' },
                },
            },
            put: {
                tags: ['Student Program'],
                summary: 'Update a student program',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateStudentProgramRequest' },
                            example: {
                                status: 'ACTIVE',
                                started_at: '2026-01-10',
                                selling_price: 1100000,
                                notes: 'Promo extended',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Student program updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StudentProgram' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                    '404': { description: 'Student program not found' },
                },
            },
            delete: {
                tags: ['Student Program'],
                summary: 'Delete a student program',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    '204': { description: 'Student program deleted' },
                    '404': { description: 'Student program not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            StudentProgramStatus: {
                type: 'string',
                enum: ['PENDING', 'TRIAL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
                example: 'ACTIVE',
            },
            StudentProgram: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    student_id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 },
                    program_package_id: { type: 'integer', example: 2 },
                    program_level_id: { type: 'integer', example: 3 },
                    status: { $ref: '#/components/schemas/StudentProgramStatus' },
                    started_at: {
                        type: 'string',
                        format: 'date',
                        nullable: true,
                        example: '2026-01-05',
                    },
                    ended_at: {
                        type: 'string',
                        format: 'date',
                        nullable: true,
                        example: '2026-06-05',
                    },
                    normal_price: { type: 'number', example: 1500000 },
                    selling_price: { type: 'number', example: 1200000 },
                    notes: {
                        type: 'string',
                        nullable: true,
                        example: 'Enrollment via Instagram promo',
                    },
                    created_at: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-01-01T00:00:00.000Z',
                    },
                    updated_at: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-01-01T00:00:00.000Z',
                    },
                    student_full_name: { type: 'string', example: 'John Doe' },
                    branch_name: { type: 'string', example: 'Central Branch' },
                    package_name: { type: 'string', example: 'Regular Package' },
                    level_name: { type: 'string', example: 'Beginner' },
                    student: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 1 },
                            full_name: { type: 'string', example: 'John Doe' },
                        },
                    },
                    branch: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 1 },
                            name: { type: 'string', example: 'Central Branch' },
                        },
                    },
                    program_package: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 2 },
                            name: { type: 'string', example: 'Regular Package' },
                        },
                    },
                    program_level: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 3 },
                            name: { type: 'string', example: 'Beginner' },
                        },
                    },
                },
            },
            CreateStudentProgramRequest: {
                type: 'object',
                required: [
                    'student_id',
                    'branch_id',
                    'program_package_id',
                    'program_level_id',
                    'status',
                    'normal_price',
                    'selling_price',
                ],
                properties: {
                    student_id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 },
                    program_package_id: { type: 'integer', example: 2 },
                    program_level_id: { type: 'integer', example: 3 },
                    status: { $ref: '#/components/schemas/StudentProgramStatus' },
                    started_at: {
                        type: 'string',
                        format: 'date',
                        example: '2026-01-05',
                    },
                    ended_at: {
                        type: 'string',
                        format: 'date',
                        example: '2026-06-05',
                    },
                    normal_price: { type: 'number', example: 1500000 },
                    selling_price: { type: 'number', example: 1200000 },
                    notes: { type: 'string', example: 'Enrollment via Instagram promo' },
                },
            },
            UpdateStudentProgramRequest: {
                type: 'object',
                properties: {
                    student_id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 },
                    program_package_id: { type: 'integer', example: 2 },
                    program_level_id: { type: 'integer', example: 3 },
                    status: { $ref: '#/components/schemas/StudentProgramStatus' },
                    started_at: {
                        type: 'string',
                        format: 'date',
                        example: '2026-01-05',
                    },
                    ended_at: {
                        type: 'string',
                        format: 'date',
                        example: '2026-06-05',
                    },
                    normal_price: { type: 'number', example: 1500000 },
                    selling_price: { type: 'number', example: 1100000 },
                    notes: { type: 'string', example: 'Promo extended' },
                },
            },
        },
    },
};
