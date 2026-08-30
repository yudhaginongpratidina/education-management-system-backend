-- ============================================================
-- TABEL ROLE MANAGEMENT
-- ============================================================
CREATE TABLE roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_name (name),
    UNIQUE KEY uq_roles_slug (slug)
)

-- ============================================================
-- TABEL MENU MANAGEMENT
-- ============================================================
CREATE TABLE menus (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    parent_id BIGINT UNSIGNED NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    icon VARCHAR(100) NULL,
    url VARCHAR(255) NULL,
    description VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_menus_slug (slug),
    INDEX idx_menus_parent_id (parent_id),
    INDEX idx_menus_parent_sort (parent_id, sort_order),
    CONSTRAINT fk_menus_parent FOREIGN KEY (parent_id) REFERENCES menus (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_menus_type CHECK (type IN ('GROUP', 'ITEM'))
);

-- ============================================================
-- TABEL ROLE MENU MANAGEMENT
-- ============================================================
CREATE TABLE role_menus (
    role_id BIGINT UNSIGNED NOT NULL,
    menu_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, menu_id),
    INDEX idx_role_menus_role_id (role_id),
    INDEX idx_role_menus_menu_id (menu_id),
    CONSTRAINT fk_role_menus_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_role_menus_menu FOREIGN KEY (menu_id) REFERENCES menus (id) ON DELETE CASCADE ON UPDATE CASCADE
)

-- ============================================================
-- TABEL USER MANAGEMENT
-- ============================================================
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(100) NULL,
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_slug (slug),
    INDEX idx_users_role (role)
)

-- ============================================================
-- TABEL PROGRAM MANAGEMENT
-- ------------------------------------------------------------
-- Program A
-- Harga dasar per sesi: Rp50.000
-- ============================================================
CREATE TABLE programs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(240) NOT NULL,
    name VARCHAR(240) NOT NULL,
    description TEXT NULL,
    requirements TEXT NULL,
    price_per_session DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_programs_slug (slug)
);

-- ============================================================
-- TABEL PROGRAM LEVEL MANAGEMENT
-- ============================================================
CREATE TABLE program_levels (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    program_id BIGINT UNSIGNED NOT NULL,
    level INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_program_levels_program_level ( program_id, level),
    CONSTRAINT fk_program_levels_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL PROGRAM PACKAGE MANAGEMENT
-- ------------------------------------------------------------
-- Program       : Program A
-- Name          : Paket A
-- Slug          : paket-a
-- Durasi        : 1 bulan
-- Jumlah sesi   : 3
-- Periode       : WEEK
-- Harga normal  : 400.000
-- Harga jual    : 400.000
-- Bonus         : 0 bulan
-- ============================================================
CREATE TABLE program_packages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    program_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    duration_months INT NOT NULL,
    sessions_per_period INT NOT NULL,
    session_period ENUM('WEEK', 'MONTH', 'DURATION') NOT NULL,
    normal_price DECIMAL(12,2) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    bonus_duration_months INT NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_program_packages_program_slug (program_id, slug),
    INDEX idx_program_packages_program_id (program_id),
    CONSTRAINT fk_program_packages_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL GURU MANAGEMENT
-- ============================================================
CREATE TABLE teachers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    phone_number VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    place_and_dob VARCHAR(255) NULL,
    last_education VARCHAR(100) NULL,
    position VARCHAR(100) NULL,
    photo VARCHAR(255) NULL,
    still_actively_working BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_teachers_slug (slug),
    INDEX idx_teachers_user_id (user_id),
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

-- ============================================================
-- TABEL GURU MANAGEMENT
-- ============================================================
CREATE TABLE teacher_programs (
    teacher_id BIGINT UNSIGNED NOT NULL,
    program_id BIGINT UNSIGNED NOT NULL,

    UNIQUE KEY uq_teacher_programs_teacher_program (teacher_id, program_id),
    INDEX idx_teacher_programs_teacher_id (teacher_id),
    INDEX idx_teacher_programs_program_id (program_id),
    CONSTRAINT fk_teacher_programs_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_programs_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
)