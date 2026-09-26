import { classAuthErrors } from '../../shared/class/class.openapi';

export const classStudentOpenApi = {
    paths: {
        // ============================================================
        // CLASS STUDENTS
        // ============================================================
        '/classes/{classId}/students': {
            get: {
                tags: ['Class Students'],
                summary: 'List students of a class (including historical members)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                responses: {
                    '200': {
                        description: 'Class students fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/ClassStudent' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND' },
                },
            },
            post: {
                tags: ['Class Students'],
                summary: 'Add a student (student program) to a class',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AddClassStudentRequest' },
                            example: { student_program_id: 10, joined_at: '2026-01-05' },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Student added to class' },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND / STUDENT_PROGRAM_NOT_FOUND' },
                },
            },
        },
        '/classes/{classId}/students/{studentProgramId}': {
            patch: {
                tags: ['Class Students'],
                summary: 'Update a class membership (joined_at / left_at)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/StudentProgramIdParam' },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateClassStudentRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Class student updated' },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND / STUDENT_NOT_IN_CLASS' },
                },
            },
            delete: {
                tags: ['Class Students'],
                summary: 'Remove a student from a class (sets left_at)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/StudentProgramIdParam' },
                ],
                responses: {
                    '200': { description: 'Student removed from class' },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_NOT_FOUND / STUDENT_NOT_IN_CLASS' },
                },
            },
        },
    },

    components: {
        parameters: {},
        schemas: {
            ClassStudent: {
                type: 'object',
                properties: {
                    class_id: { type: 'integer' },
                    student_program_id: { type: 'integer' },
                    joined_at: { type: 'string', format: 'date' },
                    left_at: { type: 'string', format: 'date', nullable: true },
                    student_id: { type: 'integer' },
                    branch_id: { type: 'integer' },
                    enrollment_status: { type: 'string' },
                    student_name: { type: 'string' },
                    package_name: { type: 'string', nullable: true },
                    level_name: { type: 'string', nullable: true },
                },
            },
            AddClassStudentRequest: {
                type: 'object',
                required: ['student_program_id'],
                properties: {
                    student_program_id: { type: 'integer', example: 10 },
                    joined_at: { type: 'string', format: 'date', example: '2026-01-05' },
                },
            },
            UpdateClassStudentRequest: {
                type: 'object',
                properties: {
                    joined_at: { type: 'string', format: 'date' },
                    left_at: { type: 'string', format: 'date', nullable: true },
                },
            },
        },
    },
};
