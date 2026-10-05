const assetQueryParams = [
    { name: 'search', in: 'query', schema: { type: 'string' } },
    { name: 'category_id', in: 'query', schema: { type: 'integer' } },
    { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
    {
        name: 'status',
        in: 'query',
        schema: {
            type: 'string',
            enum: ['ACTIVE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED'],
        },
    },
    {
        name: 'condition',
        in: 'query',
        schema: { type: 'string', enum: ['GOOD', 'FAIR', 'DAMAGED', 'BROKEN'] },
    },
    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
    { name: 'sort', in: 'query', schema: { type: 'string' } },
    { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
];

const ok = (description: string) => ({
    description,
    content: {
        'application/json': {
            schema: { type: 'object', additionalProperties: true },
        },
    },
});

export const assetOpenApi = {
    paths: {
        '/asset-categories': {
            get: {
                tags: ['Assets'],
                summary: 'List asset categories',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
                responses: { '200': ok('Categories'), '401': { description: 'Unauthorized' } },
            },
            post: {
                tags: ['Assets'],
                summary: 'Create an asset category',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AssetCategoryInput' },
                            example: {
                                name: 'Elektronik',
                                code_prefix: 'ELK',
                                description: 'Perangkat elektronik',
                            },
                        },
                    },
                },
                responses: { '201': ok('Created'), '409': { description: 'CATEGORY_EXISTS' } },
            },
        },
        '/asset-categories/{id}': {
            get: {
                tags: ['Assets'],
                summary: 'Get an asset category',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: { '200': ok('Category'), '404': { description: 'CATEGORY_NOT_FOUND' } },
            },
            put: {
                tags: ['Assets'],
                summary: 'Update an asset category',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AssetCategoryInput' },
                        },
                    },
                },
                responses: { '200': ok('Updated'), '404': { description: 'CATEGORY_NOT_FOUND' } },
            },
            delete: {
                tags: ['Assets'],
                summary: 'Delete an asset category',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': ok('Deleted'),
                    '409': { description: 'CATEGORY_IN_USE' },
                },
            },
        },
        '/assets': {
            get: {
                tags: ['Assets'],
                summary: 'List assets (filter & search)',
                security: [{ bearerAuth: [] }],
                parameters: assetQueryParams,
                responses: { '200': ok('Assets'), '401': { description: 'Unauthorized' } },
            },
            post: {
                tags: ['Assets'],
                summary: 'Create an asset (code generated automatically)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AssetInput' },
                            example: {
                                name: 'Proyektor Epson',
                                category_id: 1,
                                branch_id: 1,
                                location: 'Ruang Kelas A',
                                purchase_date: '2024-01-15',
                                purchase_price: 6500000,
                                useful_life_years: 5,
                                condition: 'GOOD',
                                status: 'IN_USE',
                                responsible_name: 'Rina Kartika',
                            },
                        },
                    },
                },
                responses: { '201': ok('Created'), '404': { description: 'CATEGORY_NOT_FOUND' } },
            },
        },
        '/assets/summary': {
            get: {
                tags: ['Assets'],
                summary: 'Asset summary (total, value, status, condition, expiry)',
                security: [{ bearerAuth: [] }],
                parameters: assetQueryParams,
                responses: { '200': ok('Summary') },
            },
        },
        '/assets/{id}': {
            get: {
                tags: ['Assets'],
                summary: 'Get an asset (with movement history)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: { '200': ok('Asset'), '404': { description: 'ASSET_NOT_FOUND' } },
            },
            put: {
                tags: ['Assets'],
                summary: 'Update an asset',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AssetInput' },
                        },
                    },
                },
                responses: { '200': ok('Updated'), '404': { description: 'ASSET_NOT_FOUND' } },
            },
            delete: {
                tags: ['Assets'],
                summary: 'Delete an asset',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: { '200': ok('Deleted'), '404': { description: 'ASSET_NOT_FOUND' } },
            },
        },
        '/assets/{id}/movements': {
            get: {
                tags: ['Assets'],
                summary: 'Asset movement history',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: { '200': ok('Movements') },
            },
            post: {
                tags: ['Assets'],
                summary: 'Record an asset movement (updates location & responsible)',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AssetMovementInput' },
                            example: {
                                movement_date: '2026-10-05',
                                to_branch_id: 2,
                                to_location: 'Ruang Kelas B',
                                to_responsible_name: 'Andi Pratama',
                                notes: 'Dipindahkan karena renovasi',
                            },
                        },
                    },
                },
                responses: {
                    '201': ok('Movement recorded'),
                    '404': { description: 'ASSET_NOT_FOUND' },
                },
            },
        },
    },
    components: {
        parameters: {},
        schemas: {
            AssetCategoryInput: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', example: 'Elektronik' },
                    code_prefix: { type: 'string', nullable: true, example: 'ELK' },
                    description: { type: 'string', nullable: true },
                    is_active: { type: 'boolean', default: true },
                },
            },
            AssetInput: {
                type: 'object',
                required: ['name', 'category_id'],
                properties: {
                    name: { type: 'string' },
                    category_id: { type: 'integer' },
                    branch_id: { type: 'integer', nullable: true },
                    location: { type: 'string', nullable: true },
                    purchase_date: { type: 'string', format: 'date', nullable: true },
                    purchase_price: { type: 'number' },
                    useful_life_years: { type: 'integer', nullable: true },
                    condition: {
                        type: 'string',
                        enum: ['GOOD', 'FAIR', 'DAMAGED', 'BROKEN'],
                    },
                    status: {
                        type: 'string',
                        enum: ['ACTIVE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED'],
                    },
                    responsible_user_id: { type: 'integer', nullable: true },
                    responsible_name: { type: 'string', nullable: true },
                    notes: { type: 'string', nullable: true },
                },
            },
            AssetMovementInput: {
                type: 'object',
                required: ['movement_date'],
                properties: {
                    movement_date: { type: 'string', format: 'date' },
                    to_branch_id: { type: 'integer', nullable: true },
                    to_location: { type: 'string', nullable: true },
                    to_responsible_user_id: { type: 'integer', nullable: true },
                    to_responsible_name: { type: 'string', nullable: true },
                    notes: { type: 'string', nullable: true },
                },
            },
        },
    },
};
