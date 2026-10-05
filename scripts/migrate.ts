// Idempotent migration for the features added to the EMS backend.
// Run with: bun ./scripts/migrate.ts
//
// Safe to run multiple times: it checks information_schema before altering
// columns and uses CREATE TABLE IF NOT EXISTS for new tables.

import mysql, { type Connection } from 'mysql2/promise';

const connection: Connection = await mysql.createConnection({
    host: process.env.DB_MAIN_HOST ?? 'localhost',
    port: Number(process.env.DB_MAIN_PORT ?? 3306),
    user: process.env.DB_MAIN_USERNAME ?? 'root',
    password: process.env.DB_MAIN_PASSWORD ?? '',
    database: process.env.DB_MAIN_DATABASE ?? 'ems',
    multipleStatements: true,
});

const columnExists = async (table: string, column: string): Promise<boolean> => {
    const [rows] = await connection.query<any[]>(
        `SELECT 1 FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1;`,
        [table, column],
    );
    return rows.length > 0;
};

const addColumnIfMissing = async (table: string, column: string, definition: string) => {
    if (await columnExists(table, column)) {
        console.log(`• ${table}.${column} already exists`);
        return;
    }
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition};`);
    console.log(`✔ added ${table}.${column}`);
};

const constraintExists = async (table: string, constraint: string): Promise<boolean> => {
    const [rows] = await connection.query<any[]>(
        `SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? LIMIT 1;`,
        [table, constraint],
    );
    return rows.length > 0;
};

const addConstraintIfMissing = async (table: string, name: string, definition: string) => {
    if (await constraintExists(table, name)) {
        console.log(`• ${table}.${name} already exists`);
        return;
    }
    await connection.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${name}\` ${definition};`);
    console.log(`✔ added ${table}.${name}`);
};

// ---------------------------------------------------------------------------
// 1. student_programs — package-driven period & intensity
// ---------------------------------------------------------------------------
await addColumnIfMissing('student_programs', 'duration_months', '`duration_months` INT NULL');
await addColumnIfMissing(
    'student_programs',
    'sessions_per_period',
    '`sessions_per_period` INT NULL',
);
await addColumnIfMissing(
    'student_programs',
    'session_period',
    "`session_period` ENUM('WEEK', 'MONTH', 'DURATION') NULL",
);
await addColumnIfMissing('student_programs', 'total_sessions', '`total_sessions` INT NULL');

// ---------------------------------------------------------------------------
// 2. landing_sections — landing page CMS
// ---------------------------------------------------------------------------
await connection.query(`
    CREATE TABLE IF NOT EXISTS landing_sections (
        section_key VARCHAR(50) NOT NULL,
        content LONGTEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_by BIGINT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (section_key),
        INDEX idx_landing_sections_active (is_active),
        CONSTRAINT fk_landing_sections_user
            FOREIGN KEY (updated_by)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
`);
console.log('✔ landing_sections ready');

// ---------------------------------------------------------------------------
// 3. session_reschedules — reschedule history
// ---------------------------------------------------------------------------
await connection.query(`
    CREATE TABLE IF NOT EXISTS session_reschedules (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        type ENUM('SESSION', 'TEACHER', 'STUDENT') NOT NULL,
        class_id BIGINT UNSIGNED NULL,
        student_program_id BIGINT UNSIGNED NULL,
        from_session_id BIGINT UNSIGNED NULL,
        to_session_id BIGINT UNSIGNED NULL,
        from_teacher_id BIGINT UNSIGNED NULL,
        to_teacher_id BIGINT UNSIGNED NULL,
        reason VARCHAR(500) NULL,
        created_by BIGINT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_session_reschedules_type (type),
        INDEX idx_session_reschedules_class (class_id),
        INDEX idx_session_reschedules_from_session (from_session_id),
        INDEX idx_session_reschedules_created_at (created_at),
        CONSTRAINT fk_session_reschedules_class
            FOREIGN KEY (class_id)
            REFERENCES classes(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_session_reschedules_student_program
            FOREIGN KEY (student_program_id)
            REFERENCES student_programs(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_session_reschedules_from_session
            FOREIGN KEY (from_session_id)
            REFERENCES class_sessions(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_session_reschedules_to_session
            FOREIGN KEY (to_session_id)
            REFERENCES class_sessions(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_session_reschedules_from_teacher
            FOREIGN KEY (from_teacher_id)
            REFERENCES teachers(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_session_reschedules_to_teacher
            FOREIGN KEY (to_teacher_id)
            REFERENCES teachers(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_session_reschedules_user
            FOREIGN KEY (created_by)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
`);
console.log('✔ session_reschedules ready');

// ---------------------------------------------------------------------------
// 4. cashflow_transactions — keuangan / cashflow
// ---------------------------------------------------------------------------
await connection.query(`
    CREATE TABLE IF NOT EXISTS cashflow_transactions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id BIGINT UNSIGNED NULL,
        transaction_date DATE NOT NULL,
        type ENUM('INCOME', 'EXPENSE') NOT NULL,
        category VARCHAR(100) NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(14,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) NULL,
        reference VARCHAR(100) NULL,
        notes VARCHAR(500) NULL,
        created_by BIGINT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_cashflow_date (transaction_date),
        INDEX idx_cashflow_type (type),
        INDEX idx_cashflow_branch (branch_id),
        CONSTRAINT fk_cashflow_branch
            FOREIGN KEY (branch_id)
            REFERENCES branches(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_cashflow_user
            FOREIGN KEY (created_by)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
`);
console.log('✔ cashflow_transactions ready');

// ---------------------------------------------------------------------------
// 5. asset management
// ---------------------------------------------------------------------------
await connection.query(`
    CREATE TABLE IF NOT EXISTS asset_categories (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(120) NOT NULL,
        code_prefix VARCHAR(10) NULL,
        description VARCHAR(255) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_asset_categories_slug (slug),
        UNIQUE KEY uq_asset_categories_name (name)
    );
`);
console.log('✔ asset_categories ready');

await connection.query(`
    CREATE TABLE IF NOT EXISTS assets (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(60) NULL,
        name VARCHAR(150) NOT NULL,
        category_id BIGINT UNSIGNED NOT NULL,
        branch_id BIGINT UNSIGNED NULL,
        location VARCHAR(150) NULL,
        purchase_date DATE NULL,
        purchase_price DECIMAL(14,2) NOT NULL DEFAULT 0,
        useful_life_years INT NULL,
        \`condition\` ENUM('GOOD', 'FAIR', 'DAMAGED', 'BROKEN') NOT NULL DEFAULT 'GOOD',
        status ENUM('ACTIVE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED')
            NOT NULL DEFAULT 'ACTIVE',
        responsible_user_id BIGINT UNSIGNED NULL,
        responsible_name VARCHAR(150) NULL,
        notes VARCHAR(500) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_assets_code (code),
        INDEX idx_assets_category (category_id),
        INDEX idx_assets_branch (branch_id),
        INDEX idx_assets_status (status),
        INDEX idx_assets_condition (\`condition\`),
        CONSTRAINT fk_assets_category
            FOREIGN KEY (category_id)
            REFERENCES asset_categories(id)
            ON DELETE RESTRICT
            ON UPDATE CASCADE,
        CONSTRAINT fk_assets_branch
            FOREIGN KEY (branch_id)
            REFERENCES branches(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_assets_user
            FOREIGN KEY (responsible_user_id)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
`);
console.log('✔ assets ready');

await connection.query(`
    CREATE TABLE IF NOT EXISTS asset_movements (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        asset_id BIGINT UNSIGNED NOT NULL,
        movement_date DATE NOT NULL,
        from_branch_id BIGINT UNSIGNED NULL,
        to_branch_id BIGINT UNSIGNED NULL,
        from_location VARCHAR(150) NULL,
        to_location VARCHAR(150) NULL,
        from_responsible_user_id BIGINT UNSIGNED NULL,
        to_responsible_user_id BIGINT UNSIGNED NULL,
        from_responsible_name VARCHAR(150) NULL,
        to_responsible_name VARCHAR(150) NULL,
        notes VARCHAR(500) NULL,
        created_by BIGINT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_asset_movements_asset (asset_id),
        INDEX idx_asset_movements_date (movement_date),
        CONSTRAINT fk_asset_movements_asset
            FOREIGN KEY (asset_id)
            REFERENCES assets(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        CONSTRAINT fk_asset_movements_from_branch
            FOREIGN KEY (from_branch_id)
            REFERENCES branches(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_asset_movements_to_branch
            FOREIGN KEY (to_branch_id)
            REFERENCES branches(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_asset_movements_from_user
            FOREIGN KEY (from_responsible_user_id)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_asset_movements_to_user
            FOREIGN KEY (to_responsible_user_id)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE,
        CONSTRAINT fk_asset_movements_user
            FOREIGN KEY (created_by)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
`);
console.log('✔ asset_movements ready');

// ---------------------------------------------------------------------------
// 6. Backfill package-driven terms for enrollments created before the columns
//    existed, and repair clearly-invalid ended_at values.
// ---------------------------------------------------------------------------
const [backfillResult] = await connection.query<any>(
    `UPDATE student_programs sp
     JOIN program_packages pp ON sp.program_package_id = pp.id
     SET
         sp.duration_months = pp.duration_months + pp.bonus_duration_months,
         sp.sessions_per_period = pp.sessions_per_period,
         sp.session_period = pp.session_period,
         sp.total_sessions = CASE
             WHEN pp.session_period = 'MONTH'
                 THEN (pp.duration_months + pp.bonus_duration_months) * pp.sessions_per_period
             WHEN pp.session_period = 'DURATION'
                 THEN pp.sessions_per_period
             ELSE ROUND((pp.duration_months + pp.bonus_duration_months) * 30.4375 / 7)
                  * pp.sessions_per_period
         END
     WHERE sp.total_sessions IS NULL`,
);
console.log(`✔ backfilled package terms (${backfillResult.affectedRows} rows)`);

const [endedResult] = await connection.query<any>(
    `UPDATE student_programs sp
     JOIN program_packages pp ON sp.program_package_id = pp.id
     SET sp.ended_at = DATE_SUB(
             DATE_ADD(sp.started_at, INTERVAL (pp.duration_months + pp.bonus_duration_months) MONTH),
             INTERVAL 1 DAY
         )
     WHERE sp.started_at IS NOT NULL
       AND (sp.ended_at IS NULL OR sp.ended_at < sp.started_at)`,
);
console.log(`✔ fixed enrollment end dates (${endedResult.affectedRows} rows)`);

// ---------------------------------------------------------------------------
// 7. classes ↔ program binding
// ---------------------------------------------------------------------------
await addColumnIfMissing('classes', 'program_id', '`program_id` BIGINT UNSIGNED NULL');
await addColumnIfMissing('classes', 'program_level_id', '`program_level_id` BIGINT UNSIGNED NULL');
await addConstraintIfMissing(
    'classes',
    'fk_classes_program',
    'FOREIGN KEY (`program_id`) REFERENCES programs(id) ON DELETE SET NULL ON UPDATE CASCADE',
);
await addConstraintIfMissing(
    'classes',
    'fk_classes_program_level',
    'FOREIGN KEY (`program_level_id`) REFERENCES program_levels(id) ON DELETE SET NULL ON UPDATE CASCADE',
);
const classIndex = await connection.query<any[]>(
    `SELECT 1 FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classes' AND INDEX_NAME = 'idx_classes_program_id' LIMIT 1;`,
);
if ((classIndex[0] as any[]).length === 0) {
    await connection.query(`ALTER TABLE classes ADD INDEX idx_classes_program_id (program_id);`);
    console.log('✔ added classes index idx_classes_program_id');
} else {
    console.log('• classes.idx_classes_program_id already exists');
}

await connection.end();
console.log('\n✅ Migration finished.');
