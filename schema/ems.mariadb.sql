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
-- TABEL BRANCH
-- ============================================================
CREATE TABLE branches (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    address VARCHAR(255) NULL,
    latitude DECIMAL(10,6) NULL,
    longitude DECIMAL(10,6) NULL,
    radius DECIMAL(10,6) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
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
-- TABEL GURU PROGRAM MANAGEMENT
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

-- ============================================================
-- TABEL GURU AVAILABILITY MANAGEMENT
-- ============================================================
CREATE TABLE teacher_availability (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    teacher_id BIGINT UNSIGNED NOT NULL,
    monday BOOLEAN NOT NULL DEFAULT FALSE,
    tuesday BOOLEAN NOT NULL DEFAULT FALSE,
    wednesday BOOLEAN NOT NULL DEFAULT FALSE,
    thursday BOOLEAN NOT NULL DEFAULT FALSE,
    friday BOOLEAN NOT NULL DEFAULT FALSE,
    saturday BOOLEAN NOT NULL DEFAULT FALSE,
    sunday BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_teacher_availability_teacher_id (teacher_id),
    CONSTRAINT fk_teacher_availability_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
)

-- ============================================================
-- TABEL GURU ASSIGNMENT BRANCH MANAGEMENT
-- ============================================================
CREATE TABLE teacher_branches (
    teacher_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    UNIQUE KEY uq_teacher_branches_teacher_branch (teacher_id, branch_id),
    INDEX idx_teacher_branches_teacher_id (teacher_id),
    INDEX idx_teacher_branches_branch_id (branch_id),
    CONSTRAINT fk_teacher_branches_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_branches_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
)

-- ============================================================
-- TEACHER ATTANDENT MANAGEMENT
-- ============================================================
CREATE TABLE teacher_attendances (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    teacher_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    status ENUM(
        'PRESENT',
        'ABSENT',
        'SICK',
        'LEAVE',
        'REMOTE',
        'OFFICIAL_DUTY',
        'HOLIDAY',
        'LATE'
    ) NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_at TIMESTAMP NULL,
    check_in_photo VARCHAR(255) NULL,
    check_out_at TIMESTAMP NULL,
    check_out_photo VARCHAR(255) NULL,
    check_in_latitude DECIMAL(10,8) NULL,
    check_in_longitude DECIMAL(11,8) NULL,
    check_out_latitude DECIMAL(10,8) NULL,
    check_out_longitude DECIMAL(11,8) NULL,
    notes VARCHAR(255) NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_attendances_teacher_branch_date (teacher_id, branch_id, attendance_date),
    INDEX idx_attendances_teacher_id (teacher_id),
    INDEX idx_attendances_date (attendance_date),
    CONSTRAINT fk_attendances_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_attendances_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE CASCADE
);


-- ============================================================
-- TABEL STUDENT MANAGEMENT
-- ============================================================
-- ============================================================
-- STUDENT MANAGEMENT
-- ============================================================
CREATE TABLE students (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NULL,
    place_birth VARCHAR(100) NULL,
    birth_date DATE NULL,
    school_level VARCHAR(100) NULL,
    father_name VARCHAR(150) NULL,
    mother_name VARCHAR(150) NULL,
    guardian_name VARCHAR(150) NULL,
    guardian_phone_number VARCHAR(30) NULL,
    instagram VARCHAR(100) NULL,
    information_source VARCHAR(100) NULL,
    photos_of_children_may_be_posted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_students_full_name (full_name),
    INDEX idx_students_birth_date (birth_date),
    INDEX idx_students_school_level (school_level),
    INDEX idx_students_guardian_phone (guardian_phone_number)
);


-- ============================================================
-- STUDENT PROGRAM / ENROLLMENT MANAGEMENT
-- ============================================================
CREATE TABLE student_programs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    program_package_id BIGINT UNSIGNED NOT NULL,
    program_level_id BIGINT UNSIGNED NOT NULL,
    status ENUM(
        'PENDING',
        'TRIAL',
        'ACTIVE',
        'COMPLETED',
        'CANCELLED',
        'EXPIRED'
    ) NOT NULL DEFAULT 'PENDING',
    started_at DATE NULL,
    ended_at DATE NULL,
    normal_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_student_programs_student_id (student_id),
    INDEX idx_student_programs_branch_id (branch_id),
    INDEX idx_student_programs_program_package_id (program_package_id),
    INDEX idx_student_programs_program_level_id (program_level_id),
    INDEX idx_student_programs_status (status),
    CONSTRAINT fk_student_programs_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_student_programs_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_student_programs_program_package
        FOREIGN KEY (program_package_id)
        REFERENCES program_packages(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_student_programs_program_level
        FOREIGN KEY (program_level_id)
        REFERENCES program_levels(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- TABEL STORAGE MANAGEMENT
-- ============================================================
CREATE TABLE storages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    original_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    extension VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_storages_slug (slug),
    INDEX idx_storages_mime_type (mime_type),
    INDEX idx_storages_created_at (created_at)
);


-- ============================================================
-- KELOMPOK BELAJAR
-- ============================================================
CREATE TABLE classes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    branch_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_classes_code (code),
    INDEX idx_classes_branch_id (branch_id),
    CONSTRAINT fk_classes_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- SISWA YANG MASUK KE DALAM KELAS TERSEBUT
-- ============================================================
CREATE TABLE class_students (
    class_id BIGINT UNSIGNED NOT NULL,
    student_program_id BIGINT UNSIGNED NOT NULL,
    joined_at DATE NOT NULL,
    left_at DATE NULL,
    PRIMARY KEY (class_id, student_program_id),
    INDEX idx_class_students_student_program (student_program_id),
    CONSTRAINT fk_class_students_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_class_students_student_program
        FOREIGN KEY (student_program_id)
        REFERENCES student_programs(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- GURU UTAMA & GURU YANG DIPERBOLEHKAN MENJADI PENGGANTI
-- ============================================================
CREATE TABLE class_teachers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    class_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    role ENUM('PRIMARY', 'SUBSTITUTE') NOT NULL DEFAULT 'PRIMARY',
    started_at DATE NOT NULL,
    ended_at DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_class_teachers (class_id, teacher_id, role, started_at),
    INDEX idx_class_teachers_class (class_id),
    INDEX idx_class_teachers_teacher (teacher_id),
    CONSTRAINT fk_class_teachers_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_class_teachers_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


-- ============================================================
-- TEMPLATE JADWAL MINGGUAN
-- ============================================================
CREATE TABLE class_schedules (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    class_id BIGINT UNSIGNED NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_class_schedules_class (class_id),
    INDEX idx_class_schedules_day_time (day_of_week, start_time, end_time),
    CONSTRAINT fk_class_schedules_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_class_schedules_day
        CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT chk_class_schedules_time
        CHECK (end_time > start_time)
);


-- ===========================================================
-- GURU AKTUAL YANG MENGAJAR PADA SESI TERSEBUT
-- ===========================================================
CREATE TABLE class_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    class_id BIGINT UNSIGNED NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    status ENUM(
        'SCHEDULED',
        'ONGOING',
        'COMPLETED',
        'CANCELLED',
        'RESCHEDULED'
    ) NOT NULL DEFAULT 'SCHEDULED',
    notes VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_class_sessions_class_date
        (class_id, scheduled_date),
    INDEX idx_class_sessions_teacher_date
        (teacher_id, scheduled_date),
    INDEX idx_class_sessions_date_time
        (scheduled_date, start_time, end_time),
    CONSTRAINT fk_class_sessions_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_class_sessions_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_class_sessions_time
        CHECK (end_time > start_time)
);

-- ===========================================================
-- PESERTA SESI
-- ===========================================================
CREATE TABLE class_session_students (
    session_id BIGINT UNSIGNED NOT NULL,
    student_program_id BIGINT UNSIGNED NOT NULL,
    attendance_status ENUM(
        'PRESENT',
        'ABSENT',
        'SICK',
        'PERMISSION',
        'RESCHEDULED'
    ) NOT NULL DEFAULT 'ABSENT',
    notes VARCHAR(500) NULL,
    PRIMARY KEY (session_id, student_program_id),
    INDEX idx_session_students_student
        (student_program_id),
    CONSTRAINT fk_session_students_session
        FOREIGN KEY (session_id)
        REFERENCES class_sessions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_session_students_student
        FOREIGN KEY (student_program_id)
        REFERENCES student_programs(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);