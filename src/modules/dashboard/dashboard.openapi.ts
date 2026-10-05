export const dashboardOpenApi = {
    paths: {
        '/dashboard/overview': {
            get: {
                tags: ['Dashboard'],
                summary: 'Rich operational dashboard overview',
                description:
                    'Aggregated operational snapshot: KPIs, enrollment status & 12-month trend, session activity, student/teacher attendance, branch performance, top programs, upcoming sessions, recent enrollments, teacher leaderboard, and attention alerts.',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Dashboard overview',
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
                                                generated_at: {
                                                    type: 'string',
                                                    format: 'date-time',
                                                },
                                                kpis: {
                                                    type: 'object',
                                                    properties: {
                                                        students_total: { type: 'integer' },
                                                        students_active: { type: 'integer' },
                                                        teachers_total: { type: 'integer' },
                                                        teachers_active: { type: 'integer' },
                                                        classes_total: { type: 'integer' },
                                                        classes_active: { type: 'integer' },
                                                        branches_total: { type: 'integer' },
                                                        programs_active: { type: 'integer' },
                                                        packages_active: { type: 'integer' },
                                                        users_total: { type: 'integer' },
                                                        new_enrollments_this_month: {
                                                            type: 'integer',
                                                        },
                                                    },
                                                },
                                                enrollment: {
                                                    type: 'object',
                                                    properties: {
                                                        total: { type: 'integer' },
                                                        this_month: { type: 'integer' },
                                                        last_month: { type: 'integer' },
                                                        by_status: {
                                                            type: 'object',
                                                            additionalProperties: {
                                                                type: 'integer',
                                                            },
                                                        },
                                                        trend: {
                                                            type: 'array',
                                                            items: {
                                                                type: 'object',
                                                                properties: {
                                                                    month: {
                                                                        type: 'string',
                                                                        example: '2026-05',
                                                                    },
                                                                    label: { type: 'string' },
                                                                    count: { type: 'integer' },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                sessions: {
                                                    type: 'object',
                                                    properties: {
                                                        today: { type: 'integer' },
                                                        this_week: { type: 'integer' },
                                                        upcoming: { type: 'integer' },
                                                        completed_this_month: { type: 'integer' },
                                                        cancelled_this_month: { type: 'integer' },
                                                        total: { type: 'integer' },
                                                    },
                                                },
                                                attendance: {
                                                    type: 'object',
                                                    properties: {
                                                        period_days: { type: 'integer' },
                                                        student: {
                                                            type: 'object',
                                                            properties: {
                                                                PRESENT: { type: 'integer' },
                                                                ABSENT: { type: 'integer' },
                                                                SICK: { type: 'integer' },
                                                                PERMISSION: { type: 'integer' },
                                                                RESCHEDULED: { type: 'integer' },
                                                                total: { type: 'integer' },
                                                                rate: {
                                                                    type: 'number',
                                                                    example: 92.4,
                                                                },
                                                            },
                                                        },
                                                        teacher_today: {
                                                            type: 'object',
                                                            additionalProperties: true,
                                                        },
                                                    },
                                                },
                                                branches: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'integer' },
                                                            name: { type: 'string' },
                                                            students: { type: 'integer' },
                                                            teachers: { type: 'integer' },
                                                            classes: { type: 'integer' },
                                                            sessions_this_month: {
                                                                type: 'integer',
                                                            },
                                                            revenue: { type: 'number' },
                                                        },
                                                    },
                                                },
                                                top_programs: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'integer' },
                                                            name: { type: 'string' },
                                                            students: { type: 'integer' },
                                                            revenue: { type: 'number' },
                                                        },
                                                    },
                                                },
                                                upcoming_sessions: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'integer' },
                                                            scheduled_date: {
                                                                type: 'string',
                                                                format: 'date',
                                                            },
                                                            start_time: { type: 'string' },
                                                            end_time: { type: 'string' },
                                                            status: { type: 'string' },
                                                            class_name: { type: 'string' },
                                                            class_code: { type: 'string' },
                                                            teacher_name: {
                                                                type: 'string',
                                                                nullable: true,
                                                            },
                                                            branch_name: {
                                                                type: 'string',
                                                                nullable: true,
                                                            },
                                                            participant_count: {
                                                                type: 'integer',
                                                            },
                                                        },
                                                    },
                                                },
                                                recent_enrollments: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'integer' },
                                                            status: { type: 'string' },
                                                            created_at: {
                                                                type: 'string',
                                                                format: 'date-time',
                                                            },
                                                            selling_price: { type: 'number' },
                                                            student_name: { type: 'string' },
                                                            package_name: {
                                                                type: 'string',
                                                                nullable: true,
                                                            },
                                                            program_name: {
                                                                type: 'string',
                                                                nullable: true,
                                                            },
                                                            level_name: {
                                                                type: 'string',
                                                                nullable: true,
                                                            },
                                                            branch_name: {
                                                                type: 'string',
                                                                nullable: true,
                                                            },
                                                        },
                                                    },
                                                },
                                                teacher_leaderboard: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'integer' },
                                                            name: { type: 'string' },
                                                            total_sessions: {
                                                                type: 'integer',
                                                            },
                                                            completed_sessions: {
                                                                type: 'integer',
                                                            },
                                                        },
                                                    },
                                                },
                                                attention: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            code: { type: 'string' },
                                                            severity: {
                                                                type: 'string',
                                                                enum: ['info', 'warning', 'danger'],
                                                            },
                                                            title: { type: 'string' },
                                                            count: { type: 'integer' },
                                                            description: { type: 'string' },
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
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/dashboard/total-branch': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total branches',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total branches count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-teacher': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total teachers',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total teachers count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-program': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total programs',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total programs count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-role': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total roles',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total roles count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-menu': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total menus',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total menus count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
        '/dashboard/total-user': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get total users',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Total users count',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: { total: { type: 'integer' } },
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
};
