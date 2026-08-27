// interface
import type { ITeacherRepository, ITeacherService } from './teacher.interface';
import type { IUserRepository } from '../user-management/user.interface';

// shared
import { create_slug } from '../../shared/libs/slug';
import { hashing_password } from '../../shared/libs/password';

export class TeacherService implements ITeacherService {
    constructor(
        private readonly teacherRepository: ITeacherRepository,
        private readonly userRepository: IUserRepository,
        private readonly container: any,
    ) {}

    async create_teacher(data: {
        full_name: string;
        slug: string;
        user_id: string;
        phone_number: string;
        address: string;
        place_and_dob: string;
        last_education: string;
        photo: string;
        email: string;
    }): Promise<any> {
        const slug = create_slug(data.full_name);
        const password_hash = await hashing_password('password123');

        const user = await this.userRepository.create_user({
            full_name: data.full_name,
            slug: slug,
            email: data.email,
            password_hash: password_hash,
            role: 'guru',
        });

        return await this.teacherRepository.create_teacher({
            ...data,
            slug: slug,
            user_id: user.id,
        });
    }

    async get_teacher(filter: {
        id?: number;
        full_name?: string;
        slug?: string;
        phone_number?: string;
    }): Promise<any> {
        return await this.teacherRepository.get_teacher(filter);
    }

    async update_teacher(data: {
        id: number;
        full_name: string;
        slug: string;
        user_id: string;
        phone_number: string;
        address: string;
        place_and_dob: string;
        last_education: string;
        photo: string;
    }): Promise<any> {
        const slug = create_slug(data.full_name);
        const user = await this.userRepository.get_user({ id: Number(data.user_id) });
        if (user.length > 0) {
            await this.userRepository.update_user({
                ...user[0],
                full_name: data.full_name,
                slug: slug,
            });
        }
        return await this.teacherRepository.update_teacher({
            ...data,
            slug: slug,
        });
    }

    async delete_teacher(slug: string): Promise<any> {
        // Find teacher
        const teacher = await this.teacherRepository.get_teacher({ slug });
        if (teacher.length > 0) {
            const user_id = teacher[0].user_id;
            const user = await this.userRepository.get_user({ id: user_id });
            if (user.length > 0) {
                await this.userRepository.delete_user(user[0].slug);
            }
        }
        return await this.teacherRepository.delete_teacher(slug);
    }
}
