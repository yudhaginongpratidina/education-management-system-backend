import { apiReference } from '@scalar/express-api-reference';
import type { Express } from 'express';

// sub open api
import { roleOpenApi } from '../modules/role-management/role.openapi';
import { menuOpenApi } from '../modules/menu-management/menu.openapi';
import { roleMenuOpenApi } from '../modules/role-menu-management/role-menu.openapi';

// sub open api
import { storageOpenApi } from '../modules/storage/storage.openapi';

// sub open api
import { userOpenApi } from '../modules/user-management/user.openapi';
import { authOpenApi } from '../modules/authentication/auth.openapi';

// sub open api
import { branchOpenApi } from '../modules/branch-management/branch.openapi';

// sub open api
import { programOpenApi } from '../modules/program-management/program.openapi';
import { programLevelOpenApi } from '../modules/program-level-management/program-level.openapi';
import { programPackageOpenApi } from '../modules/program-package-management/program-package.openapi';

// sub open api
import { teacherOpenApi } from '../modules/teacher/teacher.openapi';
import { teacherProgramOpenApi } from '../modules/teacher-program/teacher-program.openapi';
import { teacherAvailabilityOpenApi } from '../modules/teacher-availability/teacher-availability.openapi';
import { teacherAttendanceOpenApi } from '../modules/teacher-attandance/teacher_attendance.openapi';

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
            ...storageOpenApi.paths,
            ...branchOpenApi.paths,
            ...roleOpenApi.paths,
            ...menuOpenApi.paths,
            ...roleMenuOpenApi.paths,
            ...userOpenApi.paths,
            ...authOpenApi.paths,
            ...programOpenApi.paths,
            ...programLevelOpenApi.paths,
            ...programPackageOpenApi.paths,
            ...teacherOpenApi.paths,
            ...teacherProgramOpenApi.paths,
            ...teacherAvailabilityOpenApi.paths,
            ...teacherAttendanceOpenApi.paths,
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
                ...storageOpenApi.components.schemas,
                ...branchOpenApi.components.schemas,
                ...roleOpenApi.components.schemas,
                ...menuOpenApi.components.schemas,
                ...roleMenuOpenApi.components.schemas,
                ...userOpenApi.components.schemas,
                ...authOpenApi.components.schemas,
                ...programOpenApi.components.schemas,
                ...programLevelOpenApi.components.schemas,
                ...programPackageOpenApi.components.schemas,
                ...teacherOpenApi.components.schemas,
                ...teacherProgramOpenApi.components.schemas,
                ...teacherAvailabilityOpenApi.components.schemas,
                ...teacherAttendanceOpenApi.components.schemas,
            },
        },
    };

    app.use(
        '/docs',
        apiReference({
            spec: {
                content: openApiSpecification,
            },
            theme: 'fastify',
            layout: 'modern',
        }),
    );
};
