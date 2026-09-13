export const reportAttendanceOpenApi = {
    paths: {
        '/report-attendance/branch/{branch_id}': {
            get: {
                tags: ['Report Attendance'],
                summary: 'Get attendance report by branch ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'branch_id', in: 'path', required: true, schema: { type: 'integer' } },
                    {
                        name: 'month',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
                        description: 'Format: YYYY-MM',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Attendance report by branch',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { type: 'object' } },
                                        stats: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/report-attendance/teacher/{teacher_id}': {
            get: {
                tags: ['Report Attendance'],
                summary: 'Get attendance report by teacher ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacher_id', in: 'path', required: true, schema: { type: 'integer' } },
                    {
                        name: 'month',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
                        description: 'Format: YYYY-MM',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Attendance report by teacher',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { type: 'object' } },
                                        stats: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/report-attendance/export/branch/{branch_id}': {
            get: {
                tags: ['Report Attendance'],
                summary: 'Export attendance report to Excel by branch ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'branch_id', in: 'path', required: true, schema: { type: 'integer' } },
                    {
                        name: 'month',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
                        description: 'Format: YYYY-MM',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Excel file',
                        content: {
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/report-attendance/export/teacher/{teacher_id}': {
            get: {
                tags: ['Report Attendance'],
                summary: 'Export attendance report to Excel by teacher ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'teacher_id', in: 'path', required: true, schema: { type: 'integer' } },
                    {
                        name: 'month',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
                        description: 'Format: YYYY-MM',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Excel file',
                        content: {
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
    },
};
