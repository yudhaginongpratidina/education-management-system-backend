const cashflowQueryParams = [
    { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'type', in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
    { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
    { name: 'category', in: 'query', schema: { type: 'string' } },
    { name: 'search', in: 'query', schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
];

export const cashflowOpenApi = {
    paths: {
        '/cashflow': {
            get: {
                tags: ['Cashflow'],
                summary: 'List cashflow transactions (with running balance)',
                security: [{ bearerAuth: [] }],
                parameters: cashflowQueryParams,
                responses: {
                    '200': {
                        description: 'Cashflow transactions',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/CashflowTransaction',
                                            },
                                        },
                                        totals: { $ref: '#/components/schemas/CashflowTotals' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
            post: {
                tags: ['Cashflow'],
                summary: 'Create a cashflow transaction',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CashflowInput' },
                            example: {
                                transaction_date: '2026-10-05',
                                type: 'INCOME',
                                category: 'Pendaftaran',
                                description: 'Pembayaran paket Reguler - Budi',
                                amount: 350000,
                                payment_method: 'Transfer',
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Created' },
                    '400': { description: 'VALIDATION_ERROR / INVALID_AMOUNT' },
                },
            },
        },
        '/cashflow/summary': {
            get: {
                tags: ['Cashflow'],
                summary: 'Cashflow summary: totals, monthly series, by category',
                security: [{ bearerAuth: [] }],
                parameters: cashflowQueryParams,
                responses: {
                    '200': {
                        description: 'Cashflow summary',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                totals: {
                                                    $ref: '#/components/schemas/CashflowTotals',
                                                },
                                                series: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            month: { type: 'string' },
                                                            label: { type: 'string' },
                                                            income: { type: 'number' },
                                                            expense: { type: 'number' },
                                                            net: { type: 'number' },
                                                        },
                                                    },
                                                },
                                                by_category: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        additionalProperties: true,
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
            },
        },
        '/cashflow/export': {
            get: {
                tags: ['Cashflow'],
                summary: 'Export cashflow to Excel',
                security: [{ bearerAuth: [] }],
                parameters: cashflowQueryParams,
                responses: {
                    '200': {
                        description: 'Excel file',
                        content: {
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                                schema: { type: 'string', format: 'binary' },
                            },
                        },
                    },
                },
            },
        },
        '/cashflow/{id}': {
            put: {
                tags: ['Cashflow'],
                summary: 'Update a cashflow transaction',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CashflowInput' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Updated' },
                    '404': { description: 'CASHFLOW_NOT_FOUND' },
                },
            },
            delete: {
                tags: ['Cashflow'],
                summary: 'Delete a cashflow transaction',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': { description: 'Deleted' },
                    '404': { description: 'CASHFLOW_NOT_FOUND' },
                },
            },
        },
    },
    components: {
        parameters: {},
        schemas: {
            CashflowTransaction: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    branch_id: { type: 'integer', nullable: true },
                    branch_name: { type: 'string', nullable: true },
                    transaction_date: { type: 'string', format: 'date' },
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    category: { type: 'string', nullable: true },
                    description: { type: 'string' },
                    amount: { type: 'number' },
                    running_balance: { type: 'number' },
                    payment_method: { type: 'string', nullable: true },
                    reference: { type: 'string', nullable: true },
                    notes: { type: 'string', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            CashflowTotals: {
                type: 'object',
                properties: {
                    income: { type: 'number', example: 1500000 },
                    expense: { type: 'number', example: 400000 },
                    balance: { type: 'number', example: 1100000 },
                    transactions: { type: 'integer', example: 12 },
                },
            },
            CashflowInput: {
                type: 'object',
                required: ['transaction_date', 'type', 'description', 'amount'],
                properties: {
                    branch_id: { type: 'integer', nullable: true },
                    transaction_date: { type: 'string', format: 'date' },
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    category: { type: 'string', nullable: true },
                    description: { type: 'string' },
                    amount: { type: 'number' },
                    payment_method: { type: 'string', nullable: true },
                    reference: { type: 'string', nullable: true },
                    notes: { type: 'string', nullable: true },
                },
            },
        },
    },
};
