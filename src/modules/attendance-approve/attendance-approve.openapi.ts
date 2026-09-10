export const attendanceApproveOpenApi = {
    paths: {
        '/attendance-approvals': {
            get: {
                tags: ['Attendance Approve'],
                summary: 'Get unapproved attendances by branch',
                parameters: [
                    {
                        name: 'branch_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'List of unapproved attendances',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Attendance' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/attendance-approvals/{id}': {
            put: {
                tags: ['Attendance Approve'],
                summary: 'Approve or reject attendance',
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
                            schema: { $ref: '#/components/schemas/ApproveAttendanceRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Attendance approved/rejected successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { $ref: '#/components/schemas/Attendance' },
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
        schemas: {
            Attendance: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    teacher_id: { type: 'integer' },
                    branch_id: { type: 'integer' },
                    status: { type: 'string' },
                    attendance_date: { type: 'string', format: 'date' },
                    is_approved: { type: 'boolean' },
                    notes: { type: 'string', nullable: true },
                },
            },
            ApproveAttendanceRequest: {
                type: 'object',
                required: ['is_approved'],
                properties: {
                    is_approved: { type: 'boolean' },
                    notes: { type: 'string', nullable: true },
                },
            },
        },
    },
};
