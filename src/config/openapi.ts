import { apiReference } from '@scalar/express-api-reference';
import type { Express } from 'express';

// sub open api
import { roleOpenApi } from '../modules/role-management/role.openapi';
import { menuOpenApi } from '../modules/menu-management/menu.openapi';
import { roleMenuOpenApi } from '../modules/role-menu-management/role-menu.openapi';

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
            ...roleOpenApi.paths,
            ...menuOpenApi.paths,
            ...roleMenuOpenApi.paths,
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
                ...roleOpenApi.components.schemas,
                ...menuOpenApi.components.schemas,
                ...roleMenuOpenApi.components.schemas,
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
