import { Router } from 'express';
import { asyncHandler } from '../../core/http/async-handler';
import { validate } from '../../shared/middleware/validate.middleware';
import authMiddleware from '../../shared/middleware/auth.middleware';
import {
    assetCategoryParamsSchema,
    assetParamsSchema,
    createAssetCategorySchema,
    createAssetMovementSchema,
    createAssetSchema,
    listAssetCategoriesSchema,
    listAssetsSchema,
    updateAssetCategorySchema,
    updateAssetSchema,
} from './asset.validation';
import type { IAssetController } from './asset.interface';

export class AssetRoutes {
    constructor(private readonly controller: IAssetController) {}

    /** Routes mounted at /asset-categories */
    categoryRouter(): Router {
        const router = Router();
        router.use(authMiddleware);

        router.get(
            '/',
            validate(listAssetCategoriesSchema),
            asyncHandler(this.controller.getCategories),
        );
        router.post(
            '/',
            validate(createAssetCategorySchema),
            asyncHandler(this.controller.createCategory),
        );
        router.get(
            '/:id',
            validate(assetCategoryParamsSchema),
            asyncHandler(this.controller.getCategory),
        );
        router.put(
            '/:id',
            validate(updateAssetCategorySchema),
            asyncHandler(this.controller.updateCategory),
        );
        router.delete(
            '/:id',
            validate(assetCategoryParamsSchema),
            asyncHandler(this.controller.deleteCategory),
        );

        return router;
    }

    /** Routes mounted at /assets */
    assetRouter(): Router {
        const router = Router();
        router.use(authMiddleware);

        // Static route before "/:id".
        router.get(
            '/summary',
            validate(listAssetsSchema),
            asyncHandler(this.controller.getAssetSummary),
        );
        router.get('/', validate(listAssetsSchema), asyncHandler(this.controller.getAssets));
        router.get(
            '/:id/movements',
            validate(assetParamsSchema),
            asyncHandler(this.controller.getMovements),
        );
        router.post(
            '/:id/movements',
            validate(createAssetMovementSchema),
            asyncHandler(this.controller.addMovement),
        );
        router.get('/:id', validate(assetParamsSchema), asyncHandler(this.controller.getAsset));
        router.post('/', validate(createAssetSchema), asyncHandler(this.controller.createAsset));
        router.put('/:id', validate(updateAssetSchema), asyncHandler(this.controller.updateAsset));
        router.delete(
            '/:id',
            validate(assetParamsSchema),
            asyncHandler(this.controller.deleteAsset),
        );

        return router;
    }
}
