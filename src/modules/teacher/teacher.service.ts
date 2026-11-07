// errors
import { HttpError } from '../../core/errors/http.error';

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
        position: string;
        photo: string;
        still_actively_working: boolean;
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
        user_id?: string;
        phone_number: string | null;
        address: string | null;
        place_and_dob: string | null;
        last_education: string | null;
        position: string | null;
        photo: string | null;
        still_actively_working: boolean;
    }): Promise<any> {
        const slug = create_slug(data.full_name);

        if (data.user_id) {
            const user = await this.userRepository.get_user({ id: Number(data.user_id) });
            if (user.length > 0) {
                await this.userRepository.update_user({
                    ...user[0],
                    full_name: data.full_name,
                    slug: slug,
                });
            }
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

    async reset_password(slug: string, newPassword = 'password123'): Promise<any> {
        let teachers = await this.teacherRepository.get_teacher({ slug });
        if (!teachers || teachers.length === 0) {
            const numericId = Number(slug);
            if (!isNaN(numericId)) {
                teachers = await this.teacherRepository.get_teacher({ id: numericId });
            }
        }

        if (!teachers || teachers.length === 0) {
            throw new HttpError(404, 'Data guru tidak ditemukan', 'TEACHER_NOT_FOUND', true);
        }

        const teacher = teachers[0];
        if (!teacher.user_id) {
            throw new HttpError(
                400,
                'Guru ini belum memiliki akun user yang terhubung',
                'USER_NOT_LINKED',
                true,
            );
        }

        const password_hash = await hashing_password(newPassword);
        await this.userRepository.update_password({
            id: Number(teacher.user_id),
            password_hash,
        });

        return {
            teacher_id: teacher.id,
            teacher_name: teacher.full_name,
            user_id: teacher.user_id,
            message: `Password akun guru ${teacher.full_name} berhasil direset ke "${newPassword}"`,
        };
    }
}
