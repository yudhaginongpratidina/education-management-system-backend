import ExcelJS from 'exceljs';
import { HttpError } from '../../core/errors/http.error';
import type {
    CashflowFilter,
    CashflowInput,
    ICashflowRepository,
    ICashflowService,
} from './cashflow.interface';

const num = (value: unknown): number => Number(value ?? 0);
const round2 = (value: number): number => Math.round(value * 100) / 100;

const monthKey = (date: Date): string =>
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const monthLabel = (key: string): string => {
    const [year, month] = key.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('id-ID', {
        month: 'short',
        year: 'numeric',
    });
};

export class CashflowService implements ICashflowService {
    constructor(private readonly repository: ICashflowRepository) {}

    private withDefaults(filter: CashflowFilter): CashflowFilter {
        const now = new Date();
        const pad = (value: number) => String(value).padStart(2, '0');
        const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const firstDay = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
        return {
            ...filter,
            date_from: filter.date_from ?? firstDay,
            date_to: filter.date_to ?? today,
        };
    }

    private parsePagination(filter: CashflowFilter): { limit: number; offset: number } {
        const limit = Math.min(Math.max(Number(filter.limit) || 50, 1), 1000);
        const page = Math.max(Number(filter.page) || 1, 1);
        return { limit, offset: (page - 1) * limit };
    }

    async list(filterInput: CashflowFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const pagination = this.parsePagination(filter);
        const [rows, totalsRaw] = await Promise.all([
            this.repository.findAll(filter, pagination),
            this.repository.totals(filter),
        ]);

        const income = num(totalsRaw.total_in);
        const expense = num(totalsRaw.total_out);

        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            data: rows.map((row) => ({
                ...row,
                amount: num(row.amount),
                running_balance: num(row.running_balance),
            })),
            pagination: {
                limit: pagination.limit,
                offset: pagination.offset,
                page: filter.page ?? 1,
            },
            totals: {
                income,
                expense,
                balance: round2(income - expense),
                transactions: num(totalsRaw.total_transactions),
            },
        };
    }

    async create(data: CashflowInput): Promise<any> {
        if (!data.description || !String(data.description).trim()) {
            throw new HttpError(400, 'Keterangan wajib diisi', 'DESCRIPTION_REQUIRED', true);
        }
        if (!(Number(data.amount) > 0)) {
            throw new HttpError(400, 'Nominal harus lebih dari 0', 'INVALID_AMOUNT', true);
        }
        return await this.repository.create({ ...data, amount: Number(data.amount) });
    }

    async update(id: number, data: Partial<CashflowInput>): Promise<any> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new HttpError(404, 'Transaksi tidak ditemukan', 'CASHFLOW_NOT_FOUND', true);
        }
        if (data.amount !== undefined && !(Number(data.amount) > 0)) {
            throw new HttpError(400, 'Nominal harus lebih dari 0', 'INVALID_AMOUNT', true);
        }
        return await this.repository.update(id, data);
    }

    async remove(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new HttpError(404, 'Transaksi tidak ditemukan', 'CASHFLOW_NOT_FOUND', true);
        }
        await this.repository.delete(id);
    }

    async summary(filterInput: CashflowFilter): Promise<any> {
        const filter = this.withDefaults(filterInput);
        const [totalsRaw, seriesRows, categoryRows] = await Promise.all([
            this.repository.totals(filter),
            this.repository.monthlySeries(filter),
            this.repository.byCategory(filter),
        ]);

        const income = num(totalsRaw.total_in);
        const expense = num(totalsRaw.total_out);

        // Fill the last 12 months so the chart always shows a continuous axis.
        const seriesMap = new Map<string, { income: number; expense: number }>();
        for (const row of seriesRows) {
            seriesMap.set(row.month, { income: num(row.income), expense: num(row.expense) });
        }

        const endDate = new Date(`${filter.date_to}T00:00:00Z`);
        const series: {
            month: string;
            label: string;
            income: number;
            expense: number;
            net: number;
        }[] = [];
        for (let offset = 11; offset >= 0; offset -= 1) {
            const date = new Date(
                Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() - offset, 1),
            );
            const key = monthKey(date);
            const entry = seriesMap.get(key) ?? { income: 0, expense: 0 };
            series.push({
                month: key,
                label: monthLabel(key),
                income: round2(entry.income),
                expense: round2(entry.expense),
                net: round2(entry.income - entry.expense),
            });
        }

        return {
            period: { date_from: filter.date_from, date_to: filter.date_to },
            totals: {
                income: round2(income),
                expense: round2(expense),
                balance: round2(income - expense),
                transactions: num(totalsRaw.total_transactions),
            },
            series,
            by_category: categoryRows.map((row) => ({
                type: row.type,
                category: row.category,
                total: num(row.total),
                count: num(row.count),
            })),
        };
    }

    async export(filterInput: CashflowFilter): Promise<Buffer> {
        const filter = this.withDefaults({ ...filterInput, page: 1, limit: 1000 });
        const [rows, summary] = await Promise.all([
            this.repository.findAll(filter, { limit: 5000, offset: 0 }),
            this.summary(filter),
        ]);

        const workbook = new ExcelJS.Workbook();

        const sheet = workbook.addWorksheet('Cashflow');
        sheet.columns = [
            { header: 'Tanggal', key: 'transaction_date', width: 14 },
            { header: 'Keterangan', key: 'description', width: 34 },
            { header: 'Kategori', key: 'category', width: 20 },
            { header: 'Cabang', key: 'branch_name', width: 20 },
            { header: 'Masuk', key: 'income', width: 16 },
            { header: 'Keluar', key: 'expense', width: 16 },
            { header: 'Sisa', key: 'running_balance', width: 16 },
            { header: 'Metode', key: 'payment_method', width: 16 },
            { header: 'Referensi', key: 'reference', width: 18 },
            { header: 'Catatan', key: 'notes', width: 28 },
        ];
        sheet.addRows(
            rows.map((row) => ({
                transaction_date: row.transaction_date,
                description: row.description,
                category: row.category,
                branch_name: row.branch_name,
                income: row.type === 'INCOME' ? num(row.amount) : null,
                expense: row.type === 'EXPENSE' ? num(row.amount) : null,
                running_balance: num(row.running_balance),
                payment_method: row.payment_method,
                reference: row.reference,
                notes: row.notes,
            })),
        );
        sheet.getRow(1).font = { bold: true };

        const summarySheet = workbook.addWorksheet('Ringkasan');
        summarySheet.columns = [
            { header: 'Keterangan', key: 'label', width: 26 },
            { header: 'Nilai', key: 'value', width: 20 },
        ];
        summarySheet.addRows([
            { label: 'Total Masuk', value: summary.totals.income },
            { label: 'Total Keluar', value: summary.totals.expense },
            { label: 'Sisa / Saldo', value: summary.totals.balance },
            { label: 'Jumlah Transaksi', value: summary.totals.transactions },
            {
                label: 'Periode',
                value: `${summary.period.date_from} s/d ${summary.period.date_to}`,
            },
        ]);
        summarySheet.getRow(1).font = { bold: true };

        const monthlySheet = workbook.addWorksheet('Bulanan');
        monthlySheet.columns = [
            { header: 'Bulan', key: 'label', width: 16 },
            { header: 'Masuk', key: 'income', width: 16 },
            { header: 'Keluar', key: 'expense', width: 16 },
            { header: 'Selisih', key: 'net', width: 16 },
        ];
        monthlySheet.addRows(summary.series);
        monthlySheet.getRow(1).font = { bold: true };

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
}
