import { apiReference } from '@scalar/express-api-reference';
import type { Express } from 'express';
import { env } from './env';

// sub open api
// import { tenantOpenApi } from '../module/tenant/tenant.openapi';
// import { tenantDatabaseOpenApi } from '../module/tenant-database/tenant-database.openapi';

export const setupOpenApi = (app: Express) => {
    const openApiSpecification = {
        openapi: '3.0.0',
        info: {
            title: `EMS API`,
            version: `1.0.0`,
            description: 'Education Management System API Documentation',
        },
        servers: [
            {
                url: `http://localhost:4000`,
                description: 'Development server',
            },
        ],
        paths: {
            '/health': {
                get: {
                    tags: ['System'],
                    summary: 'Health check',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
            // ...tenantOpenApi.paths,
            // ...tenantDatabaseOpenApi.paths,
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                // ...tenantOpenApi.components.schemas,
                // ...tenantDatabaseOpenApi.components.schemas,
            },
        },
    };

    app.use(
        '/docs',
        apiReference({
            spec: {
                content: openApiSpecification,
            },
            theme: 'purple',
            layout: 'modern',
        }),
    );
};
