import type { Request, Response } from 'express';
import type { StudentService } from './student.service';

export class StudentController {
    constructor(private readonly studentService: StudentService) {}

    create = async (req: Request, res: Response) => {
        const student = await this.studentService.createStudent(req.body);
        res.status(201).json(student);
    };

    findAll = async (req: Request, res: Response) => {
        const students = await this.studentService.getAllStudents();
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
        const students = await this.studentService.exportStudents();
        res.json(students);
    };

    import = async (req: Request, res: Response) => {
        await this.studentService.importStudents(req.body);
        res.status(201).send();
    };
}
