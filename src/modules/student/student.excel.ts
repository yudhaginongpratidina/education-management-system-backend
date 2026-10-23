import ExcelJS from 'exceljs';
import type { Student } from './student.interface';

export interface ParsedStudentRow {
    row_number: number;
    full_name: string;
    school_level?: string;
    place_birth?: string;
    birth_date?: string;
    address?: string;
    father_name?: string;
    mother_name?: string;
    guardian_name?: string;
    guardian_phone_number?: string;
    instagram?: string;
    information_source?: string;
    photos_of_children_may_be_posted: boolean;
    status: 'VALID' | 'INVALID' | 'DUPLICATE_NAME';
    errors: string[];
}

export class StudentExcelHelper {
    /**
     * Generate an Excel workbook containing all student records
     */
    static async generateExportExcel(students: Student[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Education Management System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Data Siswa', {
            views: [{ showGridLines: true }],
        });

        worksheet.columns = [
            { header: 'No', key: 'no', width: 6 },
            { header: 'Nama Lengkap', key: 'full_name', width: 28 },
            { header: 'Jenjang Sekolah', key: 'school_level', width: 18 },
            { header: 'Tempat Lahir', key: 'place_birth', width: 18 },
            { header: 'Tanggal Lahir', key: 'birth_date', width: 16 },
            { header: 'Alamat', key: 'address', width: 36 },
            { header: 'Nama Ayah', key: 'father_name', width: 22 },
            { header: 'Nama Ibu', key: 'mother_name', width: 22 },
            { header: 'Nama Wali', key: 'guardian_name', width: 22 },
            { header: 'No HP / WA Wali', key: 'guardian_phone_number', width: 20 },
            { header: 'Instagram', key: 'instagram', width: 18 },
            { header: 'Sumber Info', key: 'information_source', width: 20 },
            { header: 'Izin Foto Publikasi', key: 'photos_of_children_may_be_posted', width: 20 },
        ];

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A8A' }, // Deep Blue
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 28;

        students.forEach((student, index) => {
            let birthDateStr = '';
            if (student.birth_date) {
                try {
                    const d = new Date(student.birth_date);
                    if (!isNaN(d.getTime())) {
                        birthDateStr = d.toISOString().slice(0, 10);
                    }
                } catch {
                    birthDateStr = String(student.birth_date).slice(0, 10);
                }
            }

            const row = worksheet.addRow({
                no: index + 1,
                full_name: student.full_name || '',
                school_level: student.school_level || '',
                place_birth: student.place_birth || '',
                birth_date: birthDateStr,
                address: student.address || '',
                father_name: student.father_name || '',
                mother_name: student.mother_name || '',
                guardian_name: student.guardian_name || '',
                guardian_phone_number: student.guardian_phone_number || '',
                instagram: student.instagram || '',
                information_source: student.information_source || '',
                photos_of_children_may_be_posted: student.photos_of_children_may_be_posted
                    ? 'Ya'
                    : 'Tidak',
            });

            row.height = 22;
            row.alignment = { vertical: 'middle' };

            // Zebra striping
            if (index % 2 === 1) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8FAFC' },
                };
            }

            // Cell borders
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                };
            });
        });

        // Center specific columns
        worksheet.getColumn('no').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getColumn('birth_date').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getColumn('photos_of_children_may_be_posted').alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Generate an Excel template for student import
     */
    static async generateTemplateExcel(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template Import Siswa', {
            views: [{ showGridLines: true }],
        });

        worksheet.columns = [
            { header: 'Nama Lengkap *', key: 'full_name', width: 28 },
            { header: 'Jenjang Sekolah', key: 'school_level', width: 18 },
            { header: 'Tempat Lahir', key: 'place_birth', width: 18 },
            { header: 'Tanggal Lahir (YYYY-MM-DD)', key: 'birth_date', width: 26 },
            { header: 'Alamat', key: 'address', width: 36 },
            { header: 'Nama Ayah', key: 'father_name', width: 22 },
            { header: 'Nama Ibu', key: 'mother_name', width: 22 },
            { header: 'Nama Wali', key: 'guardian_name', width: 22 },
            { header: 'No HP / WA Wali', key: 'guardian_phone_number', width: 20 },
            { header: 'Instagram', key: 'instagram', width: 18 },
            { header: 'Sumber Info', key: 'information_source', width: 20 },
            { header: 'Izin Foto (Ya/Tidak)', key: 'photos_of_children_may_be_posted', width: 22 },
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0D9488' }, // Teal
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 28;

        // Sample Row
        const sampleRow = worksheet.addRow({
            full_name: 'Ahmad Fauzi',
            school_level: 'SMP',
            place_birth: 'Jakarta',
            birth_date: '2012-05-15',
            address: 'Jl. Merdeka No. 10, Jakarta Selatan',
            father_name: 'Budi Santoso',
            mother_name: 'Siti Aminah',
            guardian_name: 'Budi Santoso',
            guardian_phone_number: '081234567890',
            instagram: '@ahmadfauzi',
            information_source: 'Instagram',
            photos_of_children_may_be_posted: 'Ya',
        });
        sampleRow.height = 22;
        sampleRow.font = { italic: true, color: { argb: 'FF64748B' } };

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Parse student records from an uploaded Excel file buffer
     */
    static async parseExcel(buffer: Buffer): Promise<Omit<ParsedStudentRow, 'status' | 'errors'>[]> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('File Excel tidak memiliki worksheet.');
        }

        const headers: { [colNumber: number]: string } = {};
        const headerRow = worksheet.getRow(1);

        headerRow.eachCell((cell, colNumber) => {
            const val = String(cell.value || '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9_]/g, '');

            if (val.includes('namalengkap') || val === 'nama' || val === 'fullname' || val === 'name') {
                headers[colNumber] = 'full_name';
            } else if (val.includes('jenjang') || val.includes('schoollevel')) {
                headers[colNumber] = 'school_level';
            } else if (val.includes('tempatlahir') || val.includes('placebirth')) {
                headers[colNumber] = 'place_birth';
            } else if (val.includes('tanggallahir') || val.includes('birthdate') || val.includes('tgllahir')) {
                headers[colNumber] = 'birth_date';
            } else if (val.includes('alamat') || val.includes('address')) {
                headers[colNumber] = 'address';
            } else if (val.includes('namaayah') || val === 'ayah' || val.includes('father')) {
                headers[colNumber] = 'father_name';
            } else if (val.includes('namaibu') || val === 'ibu' || val.includes('mother')) {
                headers[colNumber] = 'mother_name';
            } else if (val.includes('namawali') || val === 'wali' || val.includes('guardianname')) {
                headers[colNumber] = 'guardian_name';
            } else if (
                val.includes('telepon') ||
                val.includes('nohp') ||
                val.includes('hp') ||
                val.includes('phone') ||
                val.includes('guardianphone')
            ) {
                headers[colNumber] = 'guardian_phone_number';
            } else if (val.includes('instagram') || val === 'ig') {
                headers[colNumber] = 'instagram';
            } else if (val.includes('sumber') || val.includes('source')) {
                headers[colNumber] = 'information_source';
            } else if (val.includes('foto') || val.includes('photo')) {
                headers[colNumber] = 'photos_of_children_may_be_posted';
            }
        });

        const rows: Omit<ParsedStudentRow, 'status' | 'errors'>[] = [];

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            // Skip empty rows
            const hasValues = row.values && (Array.isArray(row.values) ? row.values.some((v) => v !== null && v !== undefined && String(v).trim() !== '') : false);
            if (!hasValues) continue;

            const rowData: Record<string, any> = {};

            row.eachCell((cell, colNumber) => {
                const key = headers[colNumber];
                if (!key) return;

                let val = cell.value;
                // ExcelJS returns rich text or formula object in some cases
                if (val && typeof val === 'object') {
                    if ('result' in val) {
                        val = (val as any).result;
                    } else if ('text' in val) {
                        val = (val as any).text;
                    } else if (val instanceof Date) {
                        // Date object
                        val = val.toISOString().slice(0, 10);
                    }
                }

                rowData[key] = val;
            });

            // Normalize full_name
            const fullName = String(rowData.full_name || '').trim();
            if (!fullName) {
                // If completely empty full_name, check if other fields exist or skip
                const anyData = Object.values(rowData).some((v) => v && String(v).trim() !== '');
                if (!anyData) continue;
            }

            // Normalize birth_date
            let birthDateStr: string | undefined = undefined;
            if (rowData.birth_date) {
                if (rowData.birth_date instanceof Date) {
                    birthDateStr = rowData.birth_date.toISOString().slice(0, 10);
                } else {
                    const rawDate = String(rowData.birth_date).trim();
                    const parsedDate = new Date(rawDate);
                    if (!isNaN(parsedDate.getTime()) && rawDate.length >= 8) {
                        birthDateStr = parsedDate.toISOString().slice(0, 10);
                    } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
                        birthDateStr = rawDate;
                    }
                }
            }

            // Normalize boolean photo permission
            let photoPerm = false;
            if (rowData.photos_of_children_may_be_posted !== undefined) {
                const rawVal = String(rowData.photos_of_children_may_be_posted).toLowerCase().trim();
                photoPerm = ['ya', 'yes', 'true', '1', 'boleh', 'ijin', 'izin'].includes(rawVal);
            }

            rows.push({
                row_number: rowNumber,
                full_name: fullName,
                school_level: rowData.school_level ? String(rowData.school_level).trim() : undefined,
                place_birth: rowData.place_birth ? String(rowData.place_birth).trim() : undefined,
                birth_date: birthDateStr,
                address: rowData.address ? String(rowData.address).trim() : undefined,
                father_name: rowData.father_name ? String(rowData.father_name).trim() : undefined,
                mother_name: rowData.mother_name ? String(rowData.mother_name).trim() : undefined,
                guardian_name: rowData.guardian_name ? String(rowData.guardian_name).trim() : undefined,
                guardian_phone_number: rowData.guardian_phone_number
                    ? String(rowData.guardian_phone_number).trim()
                    : undefined,
                instagram: rowData.instagram ? String(rowData.instagram).trim() : undefined,
                information_source: rowData.information_source
                    ? String(rowData.information_source).trim()
                    : undefined,
                photos_of_children_may_be_posted: photoPerm,
            });
        }

        return rows;
    }
}
