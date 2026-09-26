import { classAuthErrors } from '../../shared/class/class.openapi';

export const classSessionOpenApi = {
    paths: {
        // ============================================================
        // CLASS SESSIONS (nested)
        // ============================================================
        '/classes/{classId}/sessions': {
            get: {
                tags: ['Class Sessions'],
                summary: 'List sessions of a class',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date' } },
                    { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date' } },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { $ref: '#/components/schemas/SessionStatus' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Class sessions fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/ClassSession' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                },
            },
            post: {
                tags: ['Class Sessions'],
                summary: 'Create an actual learning session',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateClassSessionRequest' },
                            example: {
                                scheduled_date: '2026-10-01',
                                start_time: '09:00',
                                end_time: '10:00',
                                teacher_id: 5,
                                notes: 'First session',
                                student_program_ids: [10, 11],
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Session created' },
                    ...classAuthErrors,
                    '409': {
                        description:
                            'CLASS_SCHEDULE_CONFLICT / TEACHER_SCHEDULE_CONFLICT / CLASS_NOT_ACTIVE',
                    },
                },
            },
        },
        '/classes/{classId}/sessions/generate': {
            post: {
                tags: ['Class Sessions'],
                summary: 'Generate sessions from active recurring schedules (idempotent)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['from', 'to'],
                                properties: {
                                    from: { type: 'string', format: 'date' },
                                    to: { type: 'string', format: 'date' },
                                },
                            },
                            example: { from: '2026-10-01', to: '2026-10-31' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Sessions generated',
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
                                                created: { type: 'integer' },
                                                skipped: { type: 'integer' },
                                            },
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
        '/classes/{classId}/sessions/{id}': {
            get: {
                tags: ['Class Sessions'],
                summary: 'Get a session of a class',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/IdParam' },
                ],
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
                                        data: { $ref: '#/components/schemas/ClassSessionDetail' },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
            patch: {
                tags: ['Class Sessions'],
                summary: 'Update a session (also used for status transitions)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/IdParam' },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateClassSessionRequest' },
                            example: { status: 'ONGOING' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Session updated' },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND' },
                    '409': { description: 'INVALID_SESSION_STATUS_TRANSITION' },
                },
            },
            delete: {
                tags: ['Class Sessions'],
                summary: 'Delete a session',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/IdParam' },
                ],
                responses: {
                    '200': { description: 'Session deleted' },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
        },

        // ============================================================
        // SESSIONS (global)
        // ============================================================
        '/sessions': {
            get: {
                tags: ['Class Sessions'],
                summary: 'List sessions with filters',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'class_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'teacher_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
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
                        description: 'Sessions fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/ClassSession' },
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
        '/sessions/calendar': {
            get: {
                tags: ['Class Sessions'],
                summary: 'Calendar data derived from actual sessions',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'class_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'teacher_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
                    { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date' } },
                    { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date' } },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { $ref: '#/components/schemas/SessionStatus' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Calendar fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/CalendarEvent' },
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
        '/sessions/{id}': {
            get: {
                tags: ['Class Sessions'],
                summary: 'Get a session by ID (with participants)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': { description: 'Session fetched' },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
            patch: {
                tags: ['Class Sessions'],
                summary: 'Update a session',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateClassSessionRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Session updated' },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
            delete: {
                tags: ['Class Sessions'],
                summary: 'Delete a session',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': { description: 'Session deleted' },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
        },
        '/sessions/{id}/reschedule': {
            post: {
                tags: ['Class Sessions'],
                summary: 'Reschedule an entire session',
                description:
                    'Marks the original session as RESCHEDULED and creates a new SCHEDULED session, copying all participants.',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RescheduleSessionRequest' },
                            example: {
                                scheduled_date: '2026-10-05',
                                start_time: '09:00',
                                end_time: '10:00',
                                teacher_id: 12,
                                notes: 'Rescheduled because of a holiday',
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Session rescheduled' },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND' },
                    '409': {
                        description:
                            'INVALID_SESSION_STATUS_TRANSITION / CLASS_SCHEDULE_CONFLICT / TEACHER_SCHEDULE_CONFLICT / STUDENT_SCHEDULE_CONFLICT',
                    },
                },
            },
        },
        '/sessions/{id}/substitute-teacher': {
            post: {
                tags: ['Class Sessions'],
                summary: 'Replace the teacher of an actual session',
                description: 'The teacher must be explicitly assigned as SUBSTITUTE for the class.',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SubstituteTeacherRequest' },
                            example: { teacher_id: 25, notes: 'Primary teacher is unavailable' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Substitute teacher assigned' },
                    ...classAuthErrors,
                    '404': { description: 'SESSION_NOT_FOUND / TEACHER_NOT_FOUND' },
                    '409': {
                        description:
                            'TEACHER_NOT_ALLOWED_AS_SUBSTITUTE / TEACHER_BRANCH_MISMATCH / INVALID_SESSION_STATUS_TRANSITION',
                    },
                },
            },
        },

        // ============================================================
        // SESSION STUDENTS / ATTENDANCE
        // ============================================================
        '/sessions/{sessionId}/students': {
            get: {
                tags: ['Session Students'],
                summary: 'List participants of a session',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/SessionIdParam' }],
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
                    '404': { description: 'SESSION_NOT_FOUND' },
                },
            },
            post: {
                tags: ['Session Students'],
                summary: 'Add a student to a session',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/SessionIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AddSessionStudentRequest' },
                            example: { student_program_id: 10, attendance_status: 'ABSENT' },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Student added to session' },
                    ...classAuthErrors,
                    '409': {
                        description:
                            'STUDENT_SCHEDULE_CONFLICT / DUPLICATE_SESSION_STUDENT / INVALID_SESSION_STATUS_TRANSITION',
                    },
                },
            },
        },
        '/sessions/{sessionId}/students/{studentProgramId}': {
            patch: {
                tags: ['Session Students'],
                summary: 'Update a session participant (attendance / notes)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/SessionIdParam' },
                    { $ref: '#/components/parameters/StudentProgramIdParam' },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateSessionStudentRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Session student updated' },
                    ...classAuthErrors,
                    '404': { description: 'STUDENT_NOT_IN_SESSION' },
                },
            },
            delete: {
                tags: ['Session Students'],
                summary: 'Remove a student from a session',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/SessionIdParam' },
                    { $ref: '#/components/parameters/StudentProgramIdParam' },
                ],
                responses: {
                    '200': { description: 'Student removed from session' },
                    ...classAuthErrors,
                    '404': { description: 'STUDENT_NOT_IN_SESSION' },
                },
            },
        },
        '/sessions/{sessionId}/students/{studentProgramId}/attendance': {
            patch: {
                tags: ['Student Attendance'],
                summary: 'Update a single student attendance record',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/SessionIdParam' },
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
                    '404': { description: 'STUDENT_NOT_IN_SESSION' },
                    '409': { description: 'INVALID_SESSION_STATUS_TRANSITION' },
                },
            },
        },
        '/sessions/{sessionId}/attendance': {
            patch: {
                tags: ['Student Attendance'],
                summary: 'Bulk update attendance records for a session',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/SessionIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/BulkAttendanceRequest' },
                            example: {
                                records: [
                                    { student_program_id: 10, attendance_status: 'PRESENT' },
                                    {
                                        student_program_id: 11,
                                        attendance_status: 'SICK',
                                        notes: 'Fever',
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Attendance updated' },
                    ...classAuthErrors,
                    '409': { description: 'INVALID_SESSION_STATUS_TRANSITION' },
                },
            },
        },
    },

    components: {
        parameters: {},
        schemas: {
            ClassSession: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 100 },
                    class_id: { type: 'integer', example: 10 },
                    scheduled_date: { type: 'string', format: 'date' },
                    start_time: { type: 'string', example: '09:00:00' },
                    end_time: { type: 'string', example: '10:00:00' },
                    teacher_id: { type: 'integer' },
                    status: { $ref: '#/components/schemas/SessionStatus' },
                    notes: { type: 'string', nullable: true },
                    class_name: { type: 'string' },
                    class_code: { type: 'string' },
                    branch_id: { type: 'integer' },
                    teacher_name: { type: 'string', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            ClassSessionDetail: {
                allOf: [
                    { $ref: '#/components/schemas/ClassSession' },
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
            CreateClassSessionRequest: {
                type: 'object',
                required: ['scheduled_date', 'start_time', 'end_time', 'teacher_id'],
                properties: {
                    scheduled_date: { type: 'string', format: 'date', example: '2026-10-01' },
                    start_time: { type: 'string', example: '09:00' },
                    end_time: { type: 'string', example: '10:00' },
                    teacher_id: { type: 'integer', example: 5 },
                    status: { $ref: '#/components/schemas/SessionStatus' },
                    notes: { type: 'string', nullable: true },
                    student_program_ids: {
                        type: 'array',
                        items: { type: 'integer' },
                        example: [10, 11],
                    },
                },
            },
            UpdateClassSessionRequest: {
                type: 'object',
                properties: {
                    scheduled_date: { type: 'string', format: 'date' },
                    start_time: { type: 'string' },
                    end_time: { type: 'string' },
                    teacher_id: { type: 'integer' },
                    status: { $ref: '#/components/schemas/SessionStatus' },
                    notes: { type: 'string', nullable: true },
                },
            },
            RescheduleSessionRequest: {
                type: 'object',
                required: ['scheduled_date', 'start_time', 'end_time', 'teacher_id'],
                properties: {
                    scheduled_date: { type: 'string', format: 'date' },
                    start_time: { type: 'string' },
                    end_time: { type: 'string' },
                    teacher_id: { type: 'integer' },
                    notes: { type: 'string', nullable: true },
                },
            },
            SubstituteTeacherRequest: {
                type: 'object',
                required: ['teacher_id'],
                properties: {
                    teacher_id: { type: 'integer', example: 25 },
                    notes: { type: 'string', nullable: true },
                },
            },
            SessionStudent: {
                type: 'object',
                properties: {
                    session_id: { type: 'integer' },
                    student_program_id: { type: 'integer' },
                    attendance_status: { $ref: '#/components/schemas/AttendanceStatus' },
                    notes: { type: 'string', nullable: true },
                    student_id: { type: 'integer' },
                    branch_id: { type: 'integer' },
                    student_name: { type: 'string' },
                    package_name: { type: 'string', nullable: true },
                    level_name: { type: 'string', nullable: true },
                },
            },
            AddSessionStudentRequest: {
                type: 'object',
                required: ['student_program_id'],
                properties: {
                    student_program_id: { type: 'integer', example: 10 },
                    attendance_status: { $ref: '#/components/schemas/AttendanceStatus' },
                    notes: { type: 'string', nullable: true },
                },
            },
            UpdateSessionStudentRequest: {
                type: 'object',
                properties: {
                    attendance_status: { $ref: '#/components/schemas/AttendanceStatus' },
                    notes: { type: 'string', nullable: true },
                },
            },
            AttendanceRequest: {
                type: 'object',
                required: ['attendance_status'],
                properties: {
                    attendance_status: { $ref: '#/components/schemas/AttendanceStatus' },
                    notes: { type: 'string', nullable: true, example: null },
                },
            },
            BulkAttendanceRequest: {
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
            CalendarEvent: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 100 },
                    title: { type: 'string', example: 'Tahsin Class A' },
                    start: { type: 'string', example: '2026-10-01T09:00:00' },
                    end: { type: 'string', example: '2026-10-01T10:00:00' },
                    class_id: { type: 'integer', example: 10 },
                    teacher_id: { type: 'integer', example: 5 },
                    branch_id: { type: 'integer', example: 2 },
                    status: { $ref: '#/components/schemas/SessionStatus' },
                },
            },
        },
    },
};
