import type { Request, Response, NextFunction } from 'express';

export type CashflowType = 'INCOME' | 'EXPENSE';

export interface CashflowFilter {
    date_from?: string;
    date_to?: string;
    type?: CashflowType;
    branch_id?: number;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface CashflowInput {
    branch_id?: number | null;
    transaction_date: string;
    type: CashflowType;
    category?: string | null;
    description: string;
    amount: number;
    payment_method?: string | null;
    reference?: string | null;
    notes?: string | null;
    created_by?: number | null;
}

export interface ICashflowRepository {
    create(data: CashflowInput): Promise<any>;
    update(id: number, data: Partial<CashflowInput>): Promise<any | null>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<any | null>;
    findAll(filter: CashflowFilter, pagination?: { limit: number; offset: number }): Promise<any[]>;
    totals(filter: CashflowFilter): Promise<any>;
    monthlySeries(filter: CashflowFilter): Promise<any[]>;
    byCategory(filter: CashflowFilter): Promise<any[]>;
}

export interface ICashflowService {
    list(filter: CashflowFilter): Promise<any>;
    create(data: CashflowInput): Promise<any>;
    update(id: number, data: Partial<CashflowInput>): Promise<any>;
    remove(id: number): Promise<void>;
    summary(filter: CashflowFilter): Promise<any>;
    export(filter: CashflowFilter): Promise<Buffer>;
}

export interface ICashflowController {
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    summary(req: Request, res: Response, next: NextFunction): Promise<void>;
    export(req: Request, res: Response, next: NextFunction): Promise<void>;
}
