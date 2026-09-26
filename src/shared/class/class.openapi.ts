// Shared OpenAPI fragments for the class domain modules.

export const classAuthErrors = {
    '400': { description: 'Validation error / Bad request' },
    '401': { description: 'Unauthorized' },
    '409': { description: 'Business rule conflict' },
};

export const classOpenApiParameters = {
    ClassId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
    },
    ClassIdParam: {
        name: 'classId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
    },
    IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
    },
    SessionIdParam: {
        name: 'sessionId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
    },
    StudentProgramIdParam: {
        name: 'studentProgramId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
    },
};

export const classOpenApiSchemas = {
    ClassStatus: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
    ClassTeacherRole: {
        type: 'string',
        enum: ['PRIMARY', 'SUBSTITUTE'],
        example: 'PRIMARY',
    },
    SessionStatus: {
        type: 'string',
        enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
        example: 'SCHEDULED',
    },
    AttendanceStatus: {
        type: 'string',
        enum: ['PRESENT', 'ABSENT', 'SICK', 'PERMISSION', 'RESCHEDULED'],
        example: 'PRESENT',
    },
};
