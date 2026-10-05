import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import {
    cashflowParamsSchema,
    createCashflowSchema,
    listCashflowSchema,
    summaryCashflowSchema,
    updateCashflowSchema,
} from './cashflow.validation';
import type { ICashflowController } from './cashflow.interface';

export class CashflowRoutes {
    constructor(private readonly controller: ICashflowController) {}

    router(): Router {
        const router = Router();
        router.use(authMiddleware);

        router.get(
            '/summary',
            validate(summaryCashflowSchema),
            asyncHandler(this.controller.summary),
        );
        router.get(
            '/export',
            validate(summaryCashflowSchema),
            asyncHandler(this.controller.export),
        );
        router.get('/', validate(listCashflowSchema), asyncHandler(this.controller.list));
        router.post('/', validate(createCashflowSchema), asyncHandler(this.controller.create));
        router.put('/:id', validate(updateCashflowSchema), asyncHandler(this.controller.update));
        router.delete('/:id', validate(cashflowParamsSchema), asyncHandler(this.controller.remove));

        return router;
    }
}
