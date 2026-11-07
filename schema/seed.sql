-- Database Seeder for roles, menus, role_menus, users
-- Reference: backup_ems.sql

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. ROLES
-- ------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(7, 'super admin', 'super-admin', '-', '2026-08-23 08:51:02', '2026-08-23 08:51:02'),
(11, 'Guru', 'guru', '-', '2026-08-23 10:24:08', '2026-08-23 10:24:08')
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `slug` = VALUES(`slug`),
    `description` = VALUES(`description`),
    `updated_at` = VALUES(`updated_at`);

-- ------------------------------------------------------------
-- 2. MENUS
-- ------------------------------------------------------------
INSERT INTO `menus` (`id`, `parent_id`, `name`, `slug`, `type`, `icon`, `url`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, NULL, 'dashboard', 'dashboard', 'ITEM', 'bxs:dashboard', '/dashboard', '-', 1, 1, '2026-08-22 09:49:42', '2026-08-27 17:54:15'),
(8, 12, 'Role', 'role', 'ITEM', 'akar-icons:key', '/access-control/role', '-', 7, 1, '2026-08-23 10:20:02', '2026-09-06 19:01:32'),
(9, 12, 'menu', 'menu', 'ITEM', 'ant-design:menu-outlined', '/access-control/menu', '-', 8, 1, '2026-08-23 10:20:23', '2026-09-06 19:01:32'),
(11, 12, 'Role Menu', 'role-menu', 'ITEM', 'streamline-ultimate:login-key-bold', '/access-control/role-menu', '-', 9, 1, '2026-08-23 10:28:14', '2026-09-06 19:01:32'),
(12, NULL, 'kontrol akses', 'kontrol-akses', 'GROUP', NULL, NULL, '-', 6, 1, '2026-08-23 10:29:04', '2026-09-06 19:01:32'),
(13, NULL, 'Manajemen', 'manajemen', 'GROUP', '', '', '-', 10, 1, '2026-08-23 14:38:44', '2026-09-06 19:01:32'),
(14, NULL, 'Program Belajar', 'program-belajar', 'ITEM', 'mdi:human-male-board', '/program-management', '-', 3, 1, '2026-08-23 14:44:14', '2026-08-27 17:54:15'),
(15, NULL, 'Master', 'master', 'GROUP', NULL, NULL, '-', 2, 1, '2026-08-27 17:41:27', '2026-08-27 17:42:23'),
(16, NULL, 'Guru', 'guru', 'ITEM', 'fa-solid:chalkboard-teacher', '/teacher-management', '-', 4, 1, '2026-08-27 17:45:27', '2026-08-27 17:45:27'),
(17, NULL, 'Paket Program Belajar', 'paket-program-belajar', 'ITEM', 'mdi:book-education-outline', '/program-package-management', '-', 11, 1, '2026-08-27 17:48:58', '2026-09-06 19:01:32'),
(18, NULL, 'Akun', 'akun', 'GROUP', '', '', '-', 12, 1, '2026-08-30 23:06:39', '2026-09-06 19:01:32'),
(19, NULL, 'Ganti Password', 'ganti-password', 'ITEM', 'fluent-mdl2:password-field', '/security', '-', 13, 1, '2026-08-30 23:08:00', '2026-09-06 19:01:32'),
(20, NULL, 'Cabang', 'cabang', 'ITEM', 'mdi:domain', '/branch-management', '-', 5, 1, '2026-09-06 18:49:19', '2026-09-06 18:59:10'),
(21, NULL, 'Absen Guru', 'absen-guru', 'ITEM', 'ic:sharp-co-present', '/attendance', '-', 14, 1, '2026-09-06 18:50:42', '2026-09-06 19:01:32'),
(22, NULL, 'Riwayat Absen Saya', 'riwayat-absen-saya', 'ITEM', 'fluent:presence-away-16-regular', '/my-attendance', '-', 15, 1, '2026-09-06 18:51:33', '2026-09-06 19:01:32'),
(23, NULL, 'Persetujuan Absen', 'persetujuan-absen', 'ITEM', 'iconmind:baseline-approve-duotone-thin', '/attendance-approval', '-', 16, 1, '2026-09-11 00:46:46', '2026-09-11 00:46:58'),
(24, NULL, 'Laporan', 'laporan', 'GROUP', '', '', '-', 17, 1, '2026-09-13 23:17:15', '2026-09-13 23:17:15'),
(25, NULL, 'Export Laporan', 'export-laporan', 'ITEM', 'boxicons:file-report', '/reports', '-', 18, 1, '2026-09-13 23:18:04', '2026-10-05 00:39:15'),
(26, NULL, 'Manajemen Siswa', 'manajemen-siswa', 'GROUP', '', '', '-', 19, 1, '2026-09-27 22:42:01', '2026-09-27 22:42:01'),
(27, NULL, 'List Siswa', 'list-siswa', 'ITEM', 'arcticons:hkust-student', '/student-management', '-', 20, 1, '2026-09-27 22:43:15', '2026-09-27 22:43:15'),
(28, NULL, 'Pendaftran Siswa', 'pendaftran-siswa', 'ITEM', 'griddy-icons:student', '/student-registration', '-', 21, 1, '2026-09-27 22:44:08', '2026-09-27 22:44:08'),
(29, NULL, 'Manajemen Kelas', 'manajemen-kelas', 'GROUP', '', '', '-', 22, 1, '2026-09-27 22:44:40', '2026-09-27 22:44:40'),
(30, NULL, 'Daftar Kelas', 'daftar-kelas', 'ITEM', 'arcticons:classroom', '/class-management', '-', 23, 1, '2026-09-27 22:45:53', '2026-09-27 22:45:53'),
(31, NULL, 'Sesi Pembelajaran', 'sesi-pembelajaran', 'ITEM', 'carbon:mobile-session', '/class-session', '-', 24, 1, '2026-09-27 22:47:11', '2026-09-27 22:47:11'),
(32, NULL, 'Manajemen CMS', 'manajemen-cms', 'ITEM', 'bxl:payload-cms', '/landing-page', '-', 25, 1, '2026-09-27 22:49:31', '2026-09-27 22:49:31'),
(33, NULL, 'Cashflow', 'cashflow', 'ITEM', '', '/cashflow', '-', 26, 1, '2026-10-05 00:35:42', '2026-10-05 00:35:42'),
(34, NULL, 'Manajemen Aset', 'manajemen-aset', 'ITEM', '', '/asset-management', '-', 27, 1, '2026-10-05 00:36:37', '2026-10-05 00:36:37'),
(35, NULL, 'Manual Penggunaan', 'manual-penggunaan', 'ITEM', '', '/guide', '-', 28, 1, '2026-10-05 00:37:12', '2026-10-05 00:37:12'),
(36, NULL, 'Sesi Saya', 'sesi-saya', 'ITEM', '', '/my-sessions', '-', 29, 1, '2026-10-05 00:37:38', '2026-10-05 00:37:38')
ON DUPLICATE KEY UPDATE
    `parent_id` = VALUES(`parent_id`),
    `name` = VALUES(`name`),
    `slug` = VALUES(`slug`),
    `type` = VALUES(`type`),
    `icon` = VALUES(`icon`),
    `url` = VALUES(`url`),
    `description` = VALUES(`description`),
    `sort_order` = VALUES(`sort_order`),
    `is_active` = VALUES(`is_active`),
    `updated_at` = VALUES(`updated_at`);

-- ------------------------------------------------------------
-- 3. ROLE_MENUS
-- ------------------------------------------------------------
INSERT INTO `role_menus` (`role_id`, `menu_id`) VALUES
(7, 1), (7, 8), (7, 9), (7, 11), (7, 12), (7, 13), (7, 14), (7, 15), (7, 16),
(7, 17), (7, 18), (7, 19), (7, 20), (7, 24), (7, 25), (7, 26), (7, 27), (7, 28),
(7, 29), (7, 30), (7, 31), (7, 32), (7, 33), (7, 34), (7, 35),
(11, 1), (11, 18), (11, 19), (11, 21), (11, 22), (11, 23), (11, 27), (11, 30),
(11, 32), (11, 35), (11, 36)
ON DUPLICATE KEY UPDATE
    `role_id` = VALUES(`role_id`),
    `menu_id` = VALUES(`menu_id`);

-- ------------------------------------------------------------
-- 4. USERS
-- ------------------------------------------------------------
INSERT INTO `users` (`id`, `full_name`, `slug`, `email`, `password_hash`, `role`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'yudha ginong', 'yudha-ginong', 'yudha@gmail.com', '$2b$10$jickM2j94xIj25DhmcBNxeTvA.T7lgfXarik59sy1utsuAehL5oCS', 'super-admin', '', '2026-08-22 15:38:37', '2026-08-23 13:46:30'),
(2, 'administrator', 'administrator', 'super-user@gmail.com', '$2b$10$3/SrfI/s13eciQvdKE7T0OBJOYX1Foz42HZ0dwCGkjJuVazaRgxUi', 'super-admin', '', '2026-08-23 17:30:15', '2026-08-23 17:31:55'),
(6, 'Dini', 'dini', 'ms.dini@gmail.com', '$2b$10$kdwr9CidZTdDH61s6ew7LONkdarDthTdxHiCKgXFfR3iPfETDGc.C', 'guru', NULL, '2026-09-28 04:47:05', '2026-09-28 04:47:05'),
(7, 'Sarah', 'sarah', 'ms.sarah@gmail.com', '$2b$10$5Cro4u6eTVqXYAvvYeNyj.LplrE48kTKzTYZxXuruj0XujoeSOalm', 'guru', NULL, '2026-09-28 06:16:06', '2026-09-28 06:16:06'),
(8, 'Muhim', 'muhim', 'ms.muhim@gmail.com', '$2b$10$o6Rfy5l6STbOx9UolYlTL.9erxsjWTODX8r.xNxhdwlYtJz6pFpcC', 'guru', NULL, '2026-09-28 06:17:07', '2026-09-28 06:17:07'),
(9, 'Ade', 'ade', 'mr.ade@gmail.com', '$2b$10$Fh8eqUVzJkIeM1Y7RBWgWOR3CPcmRlrnLeNpMKux14eTU9H/W0wLq', 'guru', NULL, '2026-09-28 09:11:01', '2026-09-28 09:11:01'),
(10, 'Sulhan', 'sulhan', 'mr.aan@gmail.com', '$2b$10$67MgnwJEttpGSZy7hswYYe9YdU3BkE/guwxVkKylS3.903bYiqF8e', 'guru', NULL, '2026-09-28 15:20:08', '2026-09-28 15:20:08')
ON DUPLICATE KEY UPDATE
    `full_name` = VALUES(`full_name`),
    `slug` = VALUES(`slug`),
    `email` = VALUES(`email`),
    `password_hash` = VALUES(`password_hash`),
    `role` = VALUES(`role`),
    `avatar` = VALUES(`avatar`),
    `updated_at` = VALUES(`updated_at`);

SET FOREIGN_KEY_CHECKS = 1;
