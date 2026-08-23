// dependencies
import type { Request, Response } from 'express';

// interface
import type { IRoleService, IRoleController } from './role.interface';

export class RoleController implements IRoleController {
    constructor(private readonly service: IRoleService) {}

    create_role = async (req: Request, res: Response): Promise<any> => {
        const data = req.body;

        const response = await this.service.create_role(data);
        return res.status(200).json({
            success: true,
            message: 'Role created successfully',
            data: response,
        });
    };

    update_role = async (req: Request, res: Response): Promise<any> => {
        const { slug } = req.params;
        const data = req.body;
        const payload = { ...data, slug };

        const response = await this.service.update_role(payload);
        return res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: response,
        });
    };

    delete_role = async (req: Request, res: Response): Promise<any> => {
        const { slug } = req.params;
        const response = await this.service.delete_role(slug as string);
        return res.status(200).json({
            success: true,
            message: 'Role deleted successfully',
            data: response,
        });
    };

    get_role = async (req: Request, res: Response): Promise<any> => {
        const { limit, page, offset, ...filter } = req.query;

        const cleanFilter = Object.fromEntries(
            Object.entries(filter).filter(
                ([_, value]) => value !== '' && value !== undefined && value !== null,
            ),
        );

        let pagination;
        const limitNum = parseInt(limit as string, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
            let offsetNum = 0;
            if (offset) {
                offsetNum = parseInt(offset as string, 10);
            } else if (page) {
                const pageNum = parseInt(page as string, 10);
                if (!isNaN(pageNum) && pageNum > 0) {
                    offsetNum = (pageNum - 1) * limitNum;
                }
            }

            if (!isNaN(offsetNum) && offsetNum >= 0) {
                pagination = {
                    limit: limitNum,
                    offset: offsetNum,
                };
            }
        }

        const response = await this.service.get_role(cleanFilter as any, pagination);
        return res.status(200).json({
            success: true,
            message: 'Role fetched successfully',
            data: response,
        });
    };
}
