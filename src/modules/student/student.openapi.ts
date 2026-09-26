export const studentOpenApi = {
    paths: {
        '/students': {
            get: {
                summary: 'Get all students',
                tags: ['Student'],
                responses: {
                    200: {
                        description: 'List of students',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Student' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create a new student',
                tags: ['Student'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateStudentRequest' },
                            example: {
                                full_name: 'John Doe',
                                address: 'Jl. Merdeka No. 1, Jakarta',
                                place_birth: 'Jakarta',
                                birth_date: '2015-05-20',
                                school_level: 'SD',
                                father_name: 'Budi Santoso',
                                mother_name: 'Siti Aminah',
                                guardian_name: 'Budi Santoso',
                                guardian_phone_number: '081234567890',
                                instagram: '@johndoe',
                                information_source: 'Instagram',
                                photos_of_children_may_be_posted: true,
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Student created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Student' },
                            },
                        },
                    },
                    400: { description: 'Bad Request' },
                    409: { description: 'Student with this name already exists' },
                },
            },
        },
        '/students/{id}': {
            get: {
                summary: 'Get student by ID',
                tags: ['Student'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Student found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Student' },
                            },
                        },
                    },
                    404: { description: 'Student not found' },
                },
            },
            put: {
                summary: 'Update student',
                tags: ['Student'],
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
                            schema: { $ref: '#/components/schemas/UpdateStudentRequest' },
                            example: {
                                full_name: 'John Doe',
                                address: 'Jl. Sudirman No. 10, Bandung',
                                school_level: 'SMP',
                                guardian_phone_number: '081298765432',
                                photos_of_children_may_be_posted: false,
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Student updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Student' },
                            },
                        },
                    },
                    400: { description: 'Bad Request' },
                    404: { description: 'Student not found' },
                    409: { description: 'Student with this name already exists' },
                },
            },
            delete: {
                summary: 'Delete student',
                tags: ['Student'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    204: { description: 'Student deleted' },
                    404: { description: 'Student not found' },
                },
            },
        },
        '/students/export': {
            get: {
                summary: 'Export students',
                tags: ['Student'],
                responses: {
                    200: {
                        description: 'List of students',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Student' },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/students/import': {
            post: {
                summary: 'Import students',
                tags: ['Student'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/CreateStudentRequest' },
                            },
                            example: [
                                {
                                    full_name: 'John Doe',
                                    address: 'Jl. Merdeka No. 1, Jakarta',
                                    place_birth: 'Jakarta',
                                    birth_date: '2015-05-20',
                                    school_level: 'SD',
                                    father_name: 'Budi Santoso',
                                    mother_name: 'Siti Aminah',
                                    guardian_name: 'Budi Santoso',
                                    guardian_phone_number: '081234567890',
                                    instagram: '@johndoe',
                                    information_source: 'Instagram',
                                    photos_of_children_may_be_posted: true,
                                },
                                {
                                    full_name: 'Jane Smith',
                                    address: 'Jl. Sudirman No. 10, Bandung',
                                    place_birth: 'Bandung',
                                    birth_date: '2016-01-15',
                                    school_level: 'SD',
                                    father_name: 'Andi Wijaya',
                                    mother_name: 'Rina Wijaya',
                                    guardian_name: 'Andi Wijaya',
                                    guardian_phone_number: '081298765432',
                                    instagram: '@janesmith',
                                    information_source: 'Website',
                                    photos_of_children_may_be_posted: false,
                                },
                            ],
                        },
                    },
                },
                responses: {
                    201: { description: 'Students imported' },
                    400: { description: 'Bad Request' },
                },
            },
        },
    },
    components: {
        schemas: {
            Student: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    full_name: { type: 'string', example: 'John Doe' },
                    address: {
                        type: 'string',
                        nullable: true,
                        example: 'Jl. Merdeka No. 1, Jakarta',
                    },
                    place_birth: { type: 'string', nullable: true, example: 'Jakarta' },
                    birth_date: {
                        oneOf: [
                            { type: 'string', format: 'date' },
                            { type: 'string', format: 'date-time' },
                        ],
                        nullable: true,
                        example: '2015-05-20',
                    },
                    school_level: { type: 'string', nullable: true, example: 'SD' },
                    father_name: { type: 'string', nullable: true, example: 'Budi Santoso' },
                    mother_name: { type: 'string', nullable: true, example: 'Siti Aminah' },
                    guardian_name: { type: 'string', nullable: true, example: 'Budi Santoso' },
                    guardian_phone_number: {
                        type: 'string',
                        nullable: true,
                        example: '081234567890',
                    },
                    instagram: { type: 'string', nullable: true, example: '@johndoe' },
                    information_source: { type: 'string', nullable: true, example: 'Instagram' },
                    photos_of_children_may_be_posted: { type: 'boolean', example: true },
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
                },
            },
            CreateStudentRequest: {
                type: 'object',
                required: ['full_name'],
                properties: {
                    full_name: { type: 'string', example: 'John Doe' },
                    address: { type: 'string', example: 'Jl. Merdeka No. 1, Jakarta' },
                    place_birth: { type: 'string', example: 'Jakarta' },
                    birth_date: {
                        oneOf: [
                            { type: 'string', format: 'date' },
                            { type: 'string', format: 'date-time' },
                        ],
                        example: '2015-05-20',
                    },
                    school_level: { type: 'string', example: 'SD' },
                    father_name: { type: 'string', example: 'Budi Santoso' },
                    mother_name: { type: 'string', example: 'Siti Aminah' },
                    guardian_name: { type: 'string', example: 'Budi Santoso' },
                    guardian_phone_number: { type: 'string', example: '081234567890' },
                    instagram: { type: 'string', example: '@johndoe' },
                    information_source: { type: 'string', example: 'Instagram' },
                    photos_of_children_may_be_posted: { type: 'boolean', example: true },
                },
            },
            UpdateStudentRequest: {
                type: 'object',
                properties: {
                    full_name: { type: 'string', example: 'John Doe' },
                    address: { type: 'string', example: 'Jl. Sudirman No. 10, Bandung' },
                    place_birth: { type: 'string', example: 'Bandung' },
                    birth_date: {
                        oneOf: [
                            { type: 'string', format: 'date' },
                            { type: 'string', format: 'date-time' },
                        ],
                        example: '2015-05-20',
                    },
                    school_level: { type: 'string', example: 'SMP' },
                    father_name: { type: 'string', example: 'Budi Santoso' },
                    mother_name: { type: 'string', example: 'Siti Aminah' },
                    guardian_name: { type: 'string', example: 'Budi Santoso' },
                    guardian_phone_number: { type: 'string', example: '081298765432' },
                    instagram: { type: 'string', example: '@johndoe' },
                    information_source: { type: 'string', example: 'Instagram' },
                    photos_of_children_may_be_posted: { type: 'boolean', example: false },
                },
            },
        },
    },
};
