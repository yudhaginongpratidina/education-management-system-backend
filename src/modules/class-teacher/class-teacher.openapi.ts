import { classAuthErrors } from '../../shared/class/class.openapi';

export const classTeacherOpenApi = {
    paths: {
        // ============================================================
        // CLASS TEACHERS
        // ============================================================
        '/classes/{classId}/teachers': {
            get: {
                tags: ['Class Teachers'],
                summary: 'List teacher assignments of a class',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                responses: {
                    '200': {
                        description: 'Class teachers fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/ClassTeacher' },
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
                tags: ['Class Teachers'],
                summary: 'Assign a teacher to a class',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AddClassTeacherRequest' },
                            example: {
                                teacher_id: 5,
                                role: 'PRIMARY',
                                started_at: '2026-01-01',
                                ended_at: null,
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Teacher assigned to class' },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND / TEACHER_NOT_FOUND' },
                },
            },
        },
        '/classes/{classId}/teachers/{id}': {
            patch: {
                tags: ['Class Teachers'],
                summary: 'Update a teacher assignment',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/IdParam' },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateClassTeacherRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Class teacher updated' },
                    ...classAuthErrors,
                    '404': { description: 'INVALID_CLASS_TEACHER_ASSIGNMENT' },
                },
            },
            delete: {
                tags: ['Class Teachers'],
                summary: 'Remove a teacher assignment',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/IdParam' },
                ],
                responses: {
                    '200': { description: 'Teacher removed from class' },
                    ...classAuthErrors,
                    '404': { description: 'INVALID_CLASS_TEACHER_ASSIGNMENT' },
                },
            },
        },
    },

    components: {
        parameters: {},
        schemas: {
            ClassTeacher: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    class_id: { type: 'integer' },
                    teacher_id: { type: 'integer' },
                    role: { $ref: '#/components/schemas/ClassTeacherRole' },
                    started_at: { type: 'string', format: 'date' },
                    ended_at: { type: 'string', format: 'date', nullable: true },
                    teacher_name: { type: 'string' },
                    teacher_slug: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            AddClassTeacherRequest: {
                type: 'object',
                required: ['teacher_id', 'started_at'],
                properties: {
                    teacher_id: { type: 'integer', example: 5 },
                    role: { $ref: '#/components/schemas/ClassTeacherRole' },
                    started_at: { type: 'string', format: 'date', example: '2026-01-01' },
                    ended_at: { type: 'string', format: 'date', nullable: true },
                },
            },
            UpdateClassTeacherRequest: {
                type: 'object',
                properties: {
                    role: { $ref: '#/components/schemas/ClassTeacherRole' },
                    started_at: { type: 'string', format: 'date' },
                    ended_at: { type: 'string', format: 'date', nullable: true },
                },
            },
        },
    },
};
