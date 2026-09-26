import type { Request, Response } from 'express';
import type { StudentProgramService } from './student-program.service';

export class StudentProgramController {
    constructor(private readonly service: StudentProgramService) {}

    create = async (req: Request, res: Response) => {
        const item = await this.service.create(req.body);
        res.status(201).json(item);
    };

    findAll = async (req: Request, res: Response) => {
        const items = await this.service.findAll(req.query);
        res.json(items);
    };

    findById = async (req: Request, res: Response) => {
        const item = await this.service.findById(Number(req.params.id));
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    };

    update = async (req: Request, res: Response) => {
        const item = await this.service.update(Number(req.params.id), req.body);
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    };

    delete = async (req: Request, res: Response) => {
        await this.service.delete(Number(req.params.id));
        res.status(204).send();
    };
}
