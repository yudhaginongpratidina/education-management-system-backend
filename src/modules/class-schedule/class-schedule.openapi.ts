import { classAuthErrors } from '../../shared/class/class.openapi';

export const classScheduleOpenApi = {
    paths: {
        // ============================================================
        // CLASS SCHEDULES
        // ============================================================
        '/classes/{classId}/schedules': {
            get: {
                tags: ['Class Schedules'],
                summary: 'List recurring weekly schedules of a class',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                responses: {
                    '200': {
                        description: 'Class schedules fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/ClassSchedule' },
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
                tags: ['Class Schedules'],
                summary: 'Create a recurring weekly schedule',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/ClassIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateClassScheduleRequest' },
                            example: {
                                day_of_week: 1,
                                start_time: '08:00',
                                end_time: '09:00',
                                effective_from: '2026-01-01',
                                effective_until: null,
                                is_active: true,
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Class schedule created' },
                    ...classAuthErrors,
                    '409': { description: 'CLASS_SCHEDULE_CONFLICT' },
                },
            },
        },
        '/classes/{classId}/schedules/{id}': {
            patch: {
                tags: ['Class Schedules'],
                summary: 'Update a recurring schedule',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/IdParam' },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateClassScheduleRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Class schedule updated' },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_SCHEDULE_NOT_FOUND' },
                },
            },
            delete: {
                tags: ['Class Schedules'],
                summary: 'Delete a recurring schedule',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/ClassIdParam' },
                    { $ref: '#/components/parameters/IdParam' },
                ],
                responses: {
                    '200': { description: 'Class schedule deleted' },
                    ...classAuthErrors,
                    '404': { description: 'CLASS_SCHEDULE_NOT_FOUND' },
                },
            },
        },
    },

    components: {
        parameters: {},
        schemas: {
            ClassSchedule: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    class_id: { type: 'integer' },
                    day_of_week: { type: 'integer', minimum: 1, maximum: 7, example: 1 },
                    start_time: { type: 'string', example: '08:00:00' },
                    end_time: { type: 'string', example: '09:00:00' },
                    effective_from: { type: 'string', format: 'date' },
                    effective_until: { type: 'string', format: 'date', nullable: true },
                    is_active: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
            CreateClassScheduleRequest: {
                type: 'object',
                required: ['day_of_week', 'start_time', 'end_time', 'effective_from'],
                properties: {
                    day_of_week: { type: 'integer', minimum: 1, maximum: 7, example: 1 },
                    start_time: { type: 'string', example: '08:00' },
                    end_time: { type: 'string', example: '09:00' },
                    effective_from: { type: 'string', format: 'date', example: '2026-01-01' },
                    effective_until: { type: 'string', format: 'date', nullable: true },
                    is_active: { type: 'boolean', example: true },
                },
            },
            UpdateClassScheduleRequest: {
                type: 'object',
                properties: {
                    day_of_week: { type: 'integer', minimum: 1, maximum: 7 },
                    start_time: { type: 'string' },
                    end_time: { type: 'string' },
                    effective_from: { type: 'string', format: 'date' },
                    effective_until: { type: 'string', format: 'date', nullable: true },
                    is_active: { type: 'boolean' },
                },
            },
        },
    },
};
