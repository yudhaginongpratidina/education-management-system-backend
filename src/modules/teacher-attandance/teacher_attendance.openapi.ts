export const teacherAttendanceOpenApi = {
    paths: {
        '/teacher-attendances/report': {
            get: {
                tags: ['Teacher Attendance Management'],
                summary: 'Get teacher attendance report',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacher_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
                    { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    '200': {
                        description: 'Attendance report fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            $ref: '#/components/schemas/TeacherAttendanceReportResponse',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/teacher-attendances': {
            get: {
                tags: ['Teacher Attendance Management'],
                summary: 'Get teacher attendance',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacher_id', in: 'query', schema: { type: 'integer' } },
                    {
                        name: 'status',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: [
                                'PRESENT',
                                'ABSENT',
                                'SICK',
                                'LEAVE',
                                'REMOTE',
                                'OFFICIAL_DUTY',
                                'HOLIDAY',
                                'LATE',
                            ],
                        },
                    },
                    {
                        name: 'attendance_date',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Attendance fetched',
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
                                                $ref: '#/components/schemas/TeacherAttendanceResponse',
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
                tags: ['Teacher Attendance Management'],
                summary: 'Record teacher attendance',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateTeacherAttendanceRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Attendance recorded',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            $ref: '#/components/schemas/TeacherAttendanceResponse',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/teacher-attendances/{id}': {
            patch: {
                tags: ['Teacher Attendance Management'],
                summary: 'Update teacher attendance',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateTeacherAttendanceRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Attendance updated',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            $ref: '#/components/schemas/TeacherAttendanceResponse',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['Teacher Attendance Management'],
                summary: 'Delete teacher attendance',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    '200': { description: 'Attendance deleted' },
                    '404': { description: 'Attendance not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            TeacherAttendanceResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    teacher_id: { type: 'integer' },
                    branch_id: { type: 'integer' },
                    teacher_name: { type: 'string' },
                    teacher_slug: { type: 'string' },
                    branch_name: { type: 'string' },
                    branch_slug: { type: 'string' },
                    status: {
                        type: 'string',
                        enum: [
                            'PRESENT',
                            'ABSENT',
                            'SICK',
                            'LEAVE',
                            'REMOTE',
                            'OFFICIAL_DUTY',
                            'HOLIDAY',
                            'LATE',
                        ],
                    },
                    attendance_date: { type: 'string', format: 'date' },
                    check_in_at: { type: 'string', format: 'date-time', nullable: true },
                    check_in_photo: { type: 'string', nullable: true },
                    check_out_at: { type: 'string', format: 'date-time', nullable: true },
                    check_out_photo: { type: 'string', nullable: true },
                    check_in_latitude: { type: 'number', nullable: true },
                    check_in_longitude: { type: 'number', nullable: true },
                    check_out_latitude: { type: 'number', nullable: true },
                    check_out_longitude: { type: 'number', nullable: true },
                    notes: { type: 'string', nullable: true },
                    is_approved: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateTeacherAttendanceRequest: {
                type: 'object',
                required: ['teacher_id', 'branch_id', 'status', 'attendance_date'],
                properties: {
                    teacher_id: { type: 'integer' },
                    branch_id: { type: 'integer' },
                    status: {
                        type: 'string',
                        enum: [
                            'PRESENT',
                            'ABSENT',
                            'SICK',
                            'LEAVE',
                            'REMOTE',
                            'OFFICIAL_DUTY',
                            'HOLIDAY',
                            'LATE',
                        ],
                    },
                    attendance_date: { type: 'string', format: 'date' },
                    check_in_at: { type: 'string', format: 'date-time', nullable: true },
                    check_in_photo: { type: 'string', nullable: true },
                    check_out_at: { type: 'string', format: 'date-time', nullable: true },
                    check_out_photo: { type: 'string', nullable: true },
                    check_in_latitude: { type: 'number', nullable: true },
                    check_in_longitude: { type: 'number', nullable: true },
                    check_out_latitude: { type: 'number', nullable: true },
                    check_out_longitude: { type: 'number', nullable: true },
                    notes: { type: 'string', nullable: true },
                    is_approved: { type: 'boolean' },
                },
            },
            UpdateTeacherAttendanceRequest: {
                type: 'object',
                properties: {
                    teacher_id: { type: 'integer' },
                    branch_id: { type: 'integer' },
                    status: {
                        type: 'string',
                        enum: [
                            'PRESENT',
                            'ABSENT',
                            'SICK',
                            'LEAVE',
                            'REMOTE',
                            'OFFICIAL_DUTY',
                            'HOLIDAY',
                            'LATE',
                        ],
                    },
                    attendance_date: { type: 'string', format: 'date' },
                    check_in_at: { type: 'string', format: 'date-time', nullable: true },
                    check_in_photo: { type: 'string', nullable: true },
                    check_out_at: { type: 'string', format: 'date-time', nullable: true },
                    check_out_photo: { type: 'string', nullable: true },
                    check_in_latitude: { type: 'number', nullable: true },
                    check_in_longitude: { type: 'number', nullable: true },
                    check_out_latitude: { type: 'number', nullable: true },
                    check_out_longitude: { type: 'number', nullable: true },
                    notes: { type: 'string', nullable: true },
                    is_approved: { type: 'boolean' },
                },
            },
            TeacherAttendanceReportResponse: {
                type: 'object',
                properties: {
                    details: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                teacher_id: { type: 'integer' },
                                branch_id: { type: 'integer' },
                                teacher_name: { type: 'string' },
                                teacher_slug: { type: 'string' },
                                branch_name: { type: 'string' },
                                branch_slug: { type: 'string' },
                                attendance_date: { type: 'string', format: 'date' },
                                check_in_at: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                },
                                check_out_at: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                },
                                duration: { type: 'string', nullable: true },
                                status: { type: 'string' },
                            },
                        },
                    },
                    stats: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                count: { type: 'integer' },
                            },
                        },
                    },
                },
            },
        },
    },
};
