import type { Request, Response } from 'express';
import type { StudentService } from './student.service';

export class StudentController {
    constructor(private readonly studentService: StudentService) {}

    create = async (req: Request, res: Response) => {
        const student = await this.studentService.createStudent(req.body);
        res.status(201).json(student);
    };

    findAll = async (req: Request, res: Response) => {
        const withPrograms = req.query.with_programs !== 'false';
        const students = await this.studentService.getAllStudents(withPrograms);
        res.json(students);
    };

    findById = async (req: Request, res: Response) => {
        const student = await this.studentService.getStudentById(Number(req.params.id));
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    };

    update = async (req: Request, res: Response) => {
        const student = await this.studentService.updateStudent(Number(req.params.id), req.body);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    };

    delete = async (req: Request, res: Response) => {
        await this.studentService.deleteStudent(Number(req.params.id));
        res.status(204).send();
    };

    export = async (req: Request, res: Response) => {
        const buffer = await this.studentService.exportStudentsExcel();
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', 'attachment; filename="data-siswa.xlsx"');
        res.send(buffer);
    };

    template = async (req: Request, res: Response) => {
        const buffer = await this.studentService.getImportTemplateExcel();
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', 'attachment; filename="template-import-siswa.xlsx"');
        res.send(buffer);
    };

    previewImport = async (req: Request, res: Response) => {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: 'File Excel (.xlsx) wajib diunggah untuk preview',
            });
        }

        const previewData = await this.studentService.previewImportExcel(req.file.buffer);
        res.json({
            success: true,
            ...previewData,
        });
    };

    import = async (req: Request, res: Response) => {
        let recordsToImport: any[] = [];

        if (req.file && req.file.buffer) {
            // Direct file upload
            const preview = await this.studentService.previewImportExcel(req.file.buffer);
            recordsToImport = preview.data.filter((r) => r.status === 'VALID');
        } else if (Array.isArray(req.body)) {
            recordsToImport = req.body;
        } else if (Array.isArray(req.body?.students)) {
            recordsToImport = req.body.students;
        } else if (Array.isArray(req.body?.data)) {
            recordsToImport = req.body.data;
        }

        if (!recordsToImport || recordsToImport.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada data siswa yang valid untuk diimpor',
            });
        }

        const result = await this.studentService.importStudents(recordsToImport);
        res.status(201).json({
            success: true,
            message: `Berhasil mengimpor ${result.imported_count} siswa`,
            ...result,
        });
    };

    assign = async (req: Request, res: Response) => {
        const rawIds = req.body.student_ids ?? (req.body.student_id ? [req.body.student_id] : []);
        const student_ids = Array.isArray(rawIds) ? rawIds.map(Number) : [Number(rawIds)];

        if (!student_ids || student_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Minimal pilih satu siswa untuk di-assign',
            });
        }

        const result = await this.studentService.assignProgram({
            ...req.body,
            student_ids,
            branch_id: Number(req.body.branch_id),
            program_level_id: Number(req.body.program_level_id),
            program_package_id: req.body.program_package_id
                ? Number(req.body.program_package_id)
                : undefined,
        });

        res.status(201).json({
            success: true,
            message: `Berhasil meng-assign ${result.length} siswa ke cabang dan program`,
            data: result,
        });
    };
}
