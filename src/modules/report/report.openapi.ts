const reportQueryParams = [
    { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
    { name: 'teacher_id', in: 'query', schema: { type: 'integer' } },
    { name: 'class_id', in: 'query', schema: { type: 'integer' } },
    { name: 'status', in: 'query', schema: { type: 'string' } },
    {
        name: 'type',
        in: 'query',
        schema: { type: 'string', enum: ['SESSION', 'TEACHER', 'STUDENT'] },
    },
    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
];

const jsonResponse = (description: string) => ({
    description,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object', additionalProperties: true } },
                    stats: { type: 'object', additionalProperties: true },
                    period: { type: 'object', additionalProperties: true },
                },
            },
        },
    },
});

const excelResponse = (description: string) => ({
    description,
    content: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            schema: { type: 'string', format: 'binary' },
        },
    },
});

export const reportOpenApi = {
    paths: {
        '/reports/overview': {
            get: {
                tags: ['Reports'],
                summary: 'Reporting overview KPIs',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': jsonResponse('Overview'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/teacher-attendance': {
            get: {
                tags: ['Reports'],
                summary: 'Teacher attendance (check-in, check-out, duration)',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': jsonResponse('Teacher attendance'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/student-attendance': {
            get: {
                tags: ['Reports'],
                summary: 'Student attendance detail',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': jsonResponse('Student attendance'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/student-attendance/summary': {
            get: {
                tags: ['Reports'],
                summary: 'Student attendance summary per student',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': jsonResponse('Student attendance summary'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/sessions': {
            get: {
                tags: ['Reports'],
                summary: 'Session report with attendance per session',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': jsonResponse('Sessions'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/reschedules': {
            get: {
                tags: ['Reports'],
                summary: 'Reschedule report',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': jsonResponse('Reschedules'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/export/teacher-attendance': {
            get: {
                tags: ['Reports'],
                summary: 'Export teacher attendance to Excel',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': excelResponse('Excel file'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/export/student-attendance': {
            get: {
                tags: ['Reports'],
                summary: 'Export student attendance to Excel',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': excelResponse('Excel file'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/export/sessions': {
            get: {
                tags: ['Reports'],
                summary: 'Export sessions to Excel',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': excelResponse('Excel file'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/reports/export/reschedules': {
            get: {
                tags: ['Reports'],
                summary: 'Export reschedules to Excel',
                security: [{ bearerAuth: [] }],
                parameters: reportQueryParams,
                responses: {
                    '200': excelResponse('Excel file'),
                    '401': { description: 'Unauthorized' },
                },
            },
        },
    },
    components: { parameters: {}, schemas: {} },
};
