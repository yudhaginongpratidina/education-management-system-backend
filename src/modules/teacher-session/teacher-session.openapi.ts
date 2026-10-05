import { classAuthErrors } from '../../shared/class/class.openapi';

/**
 * OpenAPI documentation for the teacher "self service" session module.
 * All endpoints are scoped to the teacher linked to the authenticated user.
 */
export const teacherSessionOpenApi = {
    paths: {
        // ============================================================
        // MY SCHEDULE
        // ============================================================
        '/teacher/schedule': {
            get: {
                tags: ['Teacher Session'],
                summary: 'Weekly schedule of the authenticated teacher',
                description:
                    'Recurring weekly class schedule for every class the teacher is currently assigned to, including the branch location.',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Schedule fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/TeacherSchedule' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                },
            },
        },

        // ============================================================
        // MY SESSIONS
        // ============================================================
        '/teacher/sessions': {
            get: {
                tags: ['Teacher Session'],
                summary: 'List sessions taught by the authenticated teacher',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'period',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['today', 'week', 'month', 'upcoming', 'past'],
                        },
                        description: 'Convenience date window.',
                    },
                    {
                        name: 'scheduled_date',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                    { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date' } },
                    { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date' } },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { $ref: '#/components/schemas/SessionStatus' },
                    },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
                ],
                responses: {
                    '200': {
                        description: 'Your sessions fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/TeacherSession' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                },
            },
        },
        '/teacher/sessions/summary': {
            get: {
                tags: ['Teacher Session'],
                summary: 'Session counters for the authenticated teacher',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'period',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['today', 'week', 'month', 'upcoming', 'past'],
                        },
                    },
                    { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date' } },
                    { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date' } },
                ],
                responses: {
                    '200': {
                        description: 'Summary fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            $ref: '#/components/schemas/TeacherSessionSummary',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                },
            },
        },
        '/teacher/sessions/{id}': {
            get: {
                tags: ['Teacher Session'],
                summary: 'Get one of the authenticated teacher sessions (with participants)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': {
                        description: 'Session fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            $ref: '#/components/schemas/TeacherSessionDetail',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                    '403': { description: 'SESSION_NOT_OWNED' },
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
        },
        '/teacher/sessions/{id}/students': {
            get: {
                tags: ['Teacher Session'],
                summary: 'List participants of one of the authenticated teacher sessions',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': {
                        description: 'Session students fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/SessionStudent' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                    '403': { description: 'SESSION_NOT_OWNED' },
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
        },
        '/teacher/sessions/{id}/status': {
            patch: {
                tags: ['Teacher Session'],
                summary: 'Start, complete or cancel one of the authenticated teacher sessions',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: { $ref: '#/components/schemas/SessionStatus' },
                                },
                            },
                            example: { status: 'ONGOING' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Session status updated' },
                    ...classAuthErrors,
                    '403': { description: 'SESSION_NOT_OWNED' },
                    '404': { description: 'SESSION_NOT_FOUND' },
                    '409': { description: 'INVALID_SESSION_STATUS_TRANSITION' },
                },
            },
        },
        '/teacher/sessions/{id}/attendance': {
            patch: {
                tags: ['Teacher Session'],
                summary:
                    'Bulk update student attendance for one of the authenticated teacher sessions',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TeacherBulkAttendanceRequest' },
                            example: {
                                records: [
                                    { student_program_id: 10, attendance_status: 'PRESENT' },
                                    {
                                        student_program_id: 11,
                                        attendance_status: 'SICK',
                                        notes: 'Demam',
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Attendance updated' },
                    ...classAuthErrors,
                    '403': { description: 'SESSION_NOT_OWNED' },
                    '404': { description: 'STUDENT_NOT_IN_SESSION' },
                    '409': { description: 'INVALID_SESSION_STATUS_TRANSITION' },
                },
            },
        },
        '/teacher/sessions/{id}/students/{studentProgramId}/attendance': {
            patch: {
                tags: ['Teacher Session'],
                summary: 'Update a single student attendance record for the authenticated teacher',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/IdParam' },
                    { $ref: '#/components/parameters/StudentProgramIdParam' },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AttendanceRequest' },
                            example: { attendance_status: 'PRESENT', notes: null },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Attendance updated' },
                    ...classAuthErrors,
                    '403': { description: 'SESSION_NOT_OWNED' },
                    '404': { description: 'STUDENT_NOT_IN_SESSION' },
                    '409': { description: 'INVALID_SESSION_STATUS_TRANSITION' },
                },
            },
        },
    },

    components: {
        parameters: {},
        schemas: {
            TeacherSession: {
                allOf: [
                    { $ref: '#/components/schemas/ClassSession' },
                    {
                        type: 'object',
                        properties: {
                            branch_name: { type: 'string', nullable: true },
                            branch_address: { type: 'string', nullable: true },
                            class_description: { type: 'string', nullable: true },
                            participant_count: { type: 'integer' },
                            present_count: { type: 'integer' },
                        },
                    },
                ],
            },
            TeacherSessionDetail: {
                allOf: [
                    { $ref: '#/components/schemas/TeacherSession' },
                    {
                        type: 'object',
                        properties: {
                            participants: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/SessionStudent' },
                            },
                        },
                    },
                ],
            },
            TeacherSessionSummary: {
                type: 'object',
                properties: {
                    total: { type: 'integer', example: 12 },
                    scheduled: { type: 'integer', example: 4 },
                    ongoing: { type: 'integer', example: 1 },
                    completed: { type: 'integer', example: 6 },
                    cancelled: { type: 'integer', example: 1 },
                    rescheduled: { type: 'integer', example: 0 },
                    by_status: {
                        type: 'object',
                        additionalProperties: { type: 'integer' },
                    },
                },
            },
            TeacherSchedule: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 3 },
                    class_id: { type: 'integer', example: 10 },
                    class_name: { type: 'string', example: 'Tahsin Kelas A' },
                    class_code: { type: 'string', example: 'TKA-01' },
                    class_status: { $ref: '#/components/schemas/ClassStatus' },
                    day_of_week: {
                        type: 'integer',
                        example: 1,
                        description: '1 = Monday ... 7 = Sunday',
                    },
                    start_time: { type: 'string', example: '09:00:00' },
                    end_time: { type: 'string', example: '10:00:00' },
                    effective_from: { type: 'string', format: 'date' },
                    effective_until: { type: 'string', format: 'date', nullable: true },
                    branch_id: { type: 'integer', example: 2 },
                    branch_name: { type: 'string', example: 'Cabang Pusat' },
                    branch_address: { type: 'string', nullable: true },
                    teacher_role: { $ref: '#/components/schemas/ClassTeacherRole' },
                },
            },
            TeacherBulkAttendanceRequest: {
                type: 'object',
                required: ['records'],
                properties: {
                    records: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            required: ['student_program_id', 'attendance_status'],
                            properties: {
                                student_program_id: { type: 'integer' },
                                attendance_status: {
                                    $ref: '#/components/schemas/AttendanceStatus',
                                },
                                notes: { type: 'string', nullable: true },
                            },
                        },
                    },
                },
            },
        },
    },
};
