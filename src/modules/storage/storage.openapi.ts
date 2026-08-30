export const storageOpenApi = {
    paths: {
        '/storage': {
            post: {
                tags: ['Storage Management'],
                summary: 'Upload a file',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    file: {
                                        type: 'string',
                                        format: 'binary',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'File uploaded',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StorageResponse' },
                            },
                        },
                    },
                    '400': { description: 'Bad Request' },
                },
            },
        },
        '/storage/{slug}': {
            get: {
                tags: ['Storage Management'],
                summary: 'Get file details',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'File details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StorageResponse' },
                            },
                        },
                    },
                    '404': { description: 'File not found' },
                },
            },
            delete: {
                tags: ['Storage Management'],
                summary: 'Delete file',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'File deleted' },
                    '404': { description: 'File not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            StorageResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    original_name: { type: 'string' },
                    slug: { type: 'string' },
                    mime_type: { type: 'string' },
                    extension: { type: 'string', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
};
