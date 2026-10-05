import type { Request, Response, NextFunction } from 'express';

export type AssetCondition = 'GOOD' | 'FAIR' | 'DAMAGED' | 'BROKEN';
export type AssetStatus = 'ACTIVE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED' | 'LOST' | 'DISPOSED';

export interface AssetCategoryInput {
    name: string;
    slug?: string;
    code_prefix?: string | null;
    description?: string | null;
    is_active?: boolean;
}

export interface AssetInput {
    name: string;
    category_id: number;
    branch_id?: number | null;
    location?: string | null;
    purchase_date?: string | null;
    purchase_price?: number;
    useful_life_years?: number | null;
    condition?: AssetCondition;
    status?: AssetStatus;
    responsible_user_id?: number | null;
    responsible_name?: string | null;
    notes?: string | null;
    created_by?: number | null;
}

export interface AssetFilter {
    search?: string;
    category_id?: number;
    branch_id?: number;
    status?: AssetStatus;
    condition?: AssetCondition;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface AssetMovementInput {
    movement_date: string;
    to_branch_id?: number | null;
    to_location?: string | null;
    to_responsible_user_id?: number | null;
    to_responsible_name?: string | null;
    notes?: string | null;
    created_by?: number | null;
}

export interface IAssetRepository {
    // categories
    createCategory(data: AssetCategoryInput): Promise<any>;
    findCategories(filter: { search?: string }): Promise<any[]>;
    findCategoryById(id: number): Promise<any | null>;
    findCategoryByName(name: string): Promise<any | null>;
    updateCategory(id: number, data: Partial<AssetCategoryInput>): Promise<any | null>;
    deleteCategory(id: number): Promise<void>;
    countAssetsInCategory(id: number): Promise<number>;

    // assets
    createAsset(data: AssetInput): Promise<any>;
    updateAsset(id: number, data: Partial<AssetInput>): Promise<any | null>;
    updateAssetCode(id: number, code: string): Promise<void>;
    deleteAsset(id: number): Promise<void>;
    findAssetById(id: number): Promise<any | null>;
    findAssets(filter: AssetFilter, pagination?: { limit: number; offset: number }): Promise<any[]>;
    assetSummary(filter: AssetFilter): Promise<any>;

    // movements
    createMovement(data: any): Promise<any>;
    findMovementsByAsset(assetId: number): Promise<any[]>;
}

export interface IAssetService {
    createCategory(data: AssetCategoryInput): Promise<any>;
    getCategories(filter: { search?: string }): Promise<any[]>;
    getCategory(id: number): Promise<any>;
    updateCategory(id: number, data: Partial<AssetCategoryInput>): Promise<any>;
    deleteCategory(id: number): Promise<void>;

    createAsset(data: AssetInput): Promise<any>;
    getAssets(filter: AssetFilter): Promise<any>;
    getAsset(id: number): Promise<any>;
    updateAsset(id: number, data: Partial<AssetInput>): Promise<any>;
    deleteAsset(id: number): Promise<void>;
    getAssetSummary(filter: AssetFilter): Promise<any>;
    addMovement(assetId: number, data: AssetMovementInput): Promise<any>;
    getMovements(assetId: number): Promise<any[]>;
}

export interface IAssetController {
    createCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void>;

    createAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAssets(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAssetSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    addMovement(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMovements(req: Request, res: Response, next: NextFunction): Promise<void>;
}
