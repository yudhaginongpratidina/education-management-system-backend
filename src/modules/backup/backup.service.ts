import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import AdmZip from 'adm-zip';
import mysql from 'mysql2/promise';
import mysqldump from 'mysqldump';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { HttpError } from '../../core/errors/http.error';
import type { DatabaseClient } from '../../config/database/types';
import type { BackupStatus, DatabaseStats, IBackupService, UploadsStats } from './backup.interface';

const execAsync = promisify(exec);

export class BackupService implements IBackupService {
    private uploadsDir: string;

    constructor(private readonly db: DatabaseClient) {
        this.uploadsDir = path.resolve(process.cwd(), 'uploads');
    }

    private getDbConfig() {
        const main = env.databases.find((d) => d.name === 'main') || env.databases[0];
        return {
            host: main?.host || 'localhost',
            port: main?.port || 3306,
            user: main?.username || 'root',
            password: main?.password || '',
            database: main?.database || 'db_ems',
        };
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async getStatus(): Promise<BackupStatus> {
        const dbConfig = this.getDbConfig();

        // 1. Get database statistics
        let totalTables = 0;
        let totalRows = 0;
        let dbSizeBytes = 0;

        try {
            const result = await this.db.query<{
                total_tables: number;
                total_rows: number;
                total_bytes: number;
            }>(
                `SELECT 
                    COUNT(*) as total_tables,
                    COALESCE(SUM(table_rows), 0) as total_rows,
                    COALESCE(SUM(data_length + index_length), 0) as total_bytes
                 FROM information_schema.TABLES 
                 WHERE table_schema = ?`,
                [dbConfig.database],
            );

            if (result.rows.length > 0) {
                totalTables = Number(result.rows[0].total_tables || 0);
                totalRows = Number(result.rows[0].total_rows || 0);
                dbSizeBytes = Number(result.rows[0].total_bytes || 0);
            }
        } catch (error) {
            logger.warn({ error }, 'Failed to fetch database stats from information_schema');
        }

        const databaseStats: DatabaseStats = {
            databaseName: dbConfig.database,
            totalTables,
            totalRows,
            sizeBytes: dbSizeBytes,
            sizeFormatted: this.formatBytes(dbSizeBytes),
        };

        // 2. Get uploads folder statistics
        let uploadsFilesCount = 0;
        let uploadsSizeBytes = 0;

        try {
            if (!existsSync(this.uploadsDir)) {
                await fs.mkdir(this.uploadsDir, { recursive: true });
            }

            const files = await fs.readdir(this.uploadsDir);
            for (const file of files) {
                if (file === '.gitignore') continue;
                const filePath = path.join(this.uploadsDir, file);
                try {
                    const stat = await fs.stat(filePath);
                    if (stat.isFile()) {
                        uploadsFilesCount++;
                        uploadsSizeBytes += stat.size;
                    }
                } catch {
                    // Ignore inaccessible or unlinked files
                }
            }
        } catch (error) {
            logger.warn({ error }, 'Failed to read uploads folder stats');
        }

        const uploadsStats: UploadsStats = {
            totalFiles: uploadsFilesCount,
            sizeBytes: uploadsSizeBytes,
            sizeFormatted: this.formatBytes(uploadsSizeBytes),
        };

        return {
            database: databaseStats,
            uploads: uploadsStats,
            timestamp: new Date().toISOString(),
        };
    }

    private async checkDockerContainer(): Promise<string | null> {
        try {
            const { stdout } = await execAsync(
                'docker ps --filter "name=mariadb" --format "{{.Names}}"',
            );
            const lines = stdout.trim().split('\n').filter(Boolean);
            if (lines.length > 0) return lines[0];
            const { stdout: allDb } = await execAsync(
                'docker ps --filter "name=mysql" --format "{{.Names}}"',
            );
            const dbLines = allDb.trim().split('\n').filter(Boolean);
            return dbLines.length > 0 ? dbLines[0] : null;
        } catch {
            return null;
        }
    }

    private async checkLocalCommand(cmd: string): Promise<boolean> {
        try {
            await execAsync(`which ${cmd}`);
            return true;
        } catch {
            return false;
        }
    }

    async exportDatabase(): Promise<string> {
        const dbConfig = this.getDbConfig();
        const outputPath = path.join(os.tmpdir(), `ems-db-backup-${Date.now()}.sql`);

        // Check strategies:
        const hasMariadbDump = await this.checkLocalCommand('mariadb-dump');
        const hasMysqlDump = await this.checkLocalCommand('mysqldump');
        const dockerContainer = await this.checkDockerContainer();

        logger.info(
            { hasMariadbDump, hasMysqlDump, dockerContainer, db: dbConfig.database },
            'Starting database export',
        );

        // STRATEGY 1: Local mariadb-dump / mysqldump CLI
        if (hasMariadbDump || hasMysqlDump) {
            const bin = hasMariadbDump ? 'mariadb-dump' : 'mysqldump';
            const args = [
                `-h${dbConfig.host}`,
                `-P${dbConfig.port}`,
                `-u${dbConfig.user}`,
                dbConfig.password ? `-p${dbConfig.password}` : '',
                '--routines',
                '--triggers',
                '--events',
                '--single-transaction',
                '--add-drop-table',
                '--complete-insert',
                dbConfig.database,
            ].filter(Boolean);

            await new Promise<void>((resolve, reject) => {
                const child = spawn(bin, args);
                const outStream = createReadStream ? fs.open(outputPath, 'w') : null;
                outStream
                    .then(async (handle) => {
                        const stream = handle.createWriteStream();
                        child.stdout.pipe(stream);

                        let errOutput = '';
                        child.stderr.on('data', (d) => (errOutput += d.toString()));

                        child.on('close', (code) => {
                            if (code === 0) resolve();
                            else reject(new Error(`${bin} failed with code ${code}: ${errOutput}`));
                        });
                        child.on('error', reject);
                    })
                    .catch(reject);
            });

            return outputPath;
        }

        // STRATEGY 2: Docker mariadb-container
        if (dockerContainer) {
            const args = [
                'exec',
                dockerContainer,
                'mariadb-dump',
                `-u${dbConfig.user}`,
                `-p${dbConfig.password}`,
                '--routines',
                '--triggers',
                '--single-transaction',
                '--add-drop-table',
                dbConfig.database,
            ];

            await new Promise<void>((resolve, reject) => {
                const child = spawn('docker', args);
                fs.open(outputPath, 'w')
                    .then(async (handle) => {
                        const stream = handle.createWriteStream();
                        child.stdout.pipe(stream);

                        let errOutput = '';
                        child.stderr.on('data', (d) => (errOutput += d.toString()));

                        child.on('close', (code) => {
                            if (code === 0) resolve();
                            else reject(new Error(`docker mariadb-dump failed: ${errOutput}`));
                        });
                        child.on('error', reject);
                    })
                    .catch(reject);
            });

            return outputPath;
        }

        // STRATEGY 3: Pure JS mysqldump npm package fallback
        logger.info('Falling back to pure JS mysqldump package');
        const dumpResult = await mysqldump({
            connection: {
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database,
            },
            dump: {
                schema: {
                    table: {
                        dropIfExist: true,
                    },
                },
            },
            returnDump: true,
        });

        const dumpHeader = `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

`;
        const dumpFooter = `
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
`;

        const fullSql = `${dumpHeader}${dumpResult.dump.schema || ''}\n\n${dumpResult.dump.data || ''}\n\n${dumpFooter}`;
        await fs.writeFile(outputPath, fullSql, 'utf-8');
        return outputPath;
    }

    async importDatabase(filePath: string): Promise<{ success: boolean; message: string }> {
        const dbConfig = this.getDbConfig();

        // Validate file exists & not empty
        try {
            const stat = await fs.stat(filePath);
            if (stat.size === 0) {
                throw new HttpError(400, 'File SQL backup kosong', 'INVALID_BACKUP_FILE', true);
            }
        } catch (e: any) {
            if (e instanceof HttpError) throw e;
            throw new HttpError(400, 'File SQL tidak ditemukan', 'FILE_NOT_FOUND', true);
        }

        const hasMariadb = await this.checkLocalCommand('mariadb');
        const hasMysql = await this.checkLocalCommand('mysql');
        const dockerContainer = await this.checkDockerContainer();

        logger.info(
            { hasMariadb, hasMysql, dockerContainer, db: dbConfig.database },
            'Starting database import',
        );

        let importSucceeded = false;
        let lastError = '';

        // STRATEGY 1: Docker exec mariadb (most reliable for current docker setup)
        if (dockerContainer) {
            try {
                await new Promise<void>((resolve, reject) => {
                    const args = [
                        'exec',
                        '-i',
                        dockerContainer,
                        'mariadb',
                        `-u${dbConfig.user}`,
                        `-p${dbConfig.password}`,
                        dbConfig.database,
                    ];
                    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
                    const fileStream = createReadStream(filePath);

                    fileStream.pipe(child.stdin);

                    let stderr = '';
                    child.stderr.on('data', (d) => (stderr += d.toString()));

                    child.on('close', (code) => {
                        if (code === 0) resolve();
                        else
                            reject(
                                new Error(`Docker mariadb import failed (code ${code}): ${stderr}`),
                            );
                    });
                    child.on('error', reject);
                });
                importSucceeded = true;
            } catch (err: any) {
                lastError = err.message;
                logger.warn({ err }, 'Docker import failed, trying next strategy');
            }
        }

        // STRATEGY 2: Local mariadb / mysql CLI
        if (!importSucceeded && (hasMariadb || hasMysql)) {
            try {
                const bin = hasMariadb ? 'mariadb' : 'mysql';
                await new Promise<void>((resolve, reject) => {
                    const args = [
                        `-h${dbConfig.host}`,
                        `-P${dbConfig.port}`,
                        `-u${dbConfig.user}`,
                        dbConfig.password ? `-p${dbConfig.password}` : '',
                        dbConfig.database,
                    ].filter(Boolean);

                    const child = spawn(bin, args, { stdio: ['pipe', 'pipe', 'pipe'] });
                    const fileStream = createReadStream(filePath);
                    fileStream.pipe(child.stdin);

                    let stderr = '';
                    child.stderr.on('data', (d) => (stderr += d.toString()));

                    child.on('close', (code) => {
                        if (code === 0) resolve();
                        else reject(new Error(`${bin} import failed (code ${code}): ${stderr}`));
                    });
                    child.on('error', reject);
                });
                importSucceeded = true;
            } catch (err: any) {
                lastError = err.message;
                logger.warn({ err }, 'CLI import failed, trying next strategy');
            }
        }

        // STRATEGY 3: Fallback using mysql2 with multipleStatements
        if (!importSucceeded) {
            try {
                const connection = await mysql.createConnection({
                    host: dbConfig.host,
                    port: dbConfig.port,
                    user: dbConfig.user,
                    password: dbConfig.password,
                    database: dbConfig.database,
                    multipleStatements: true,
                });

                const sqlContent = await fs.readFile(filePath, 'utf-8');
                // Ensure foreign key checks are disabled during restore
                await connection.query('SET FOREIGN_KEY_CHECKS = 0; SET UNIQUE_CHECKS = 0;');
                await connection.query(sqlContent);
                await connection.query('SET FOREIGN_KEY_CHECKS = 1; SET UNIQUE_CHECKS = 1;');
                await connection.end();

                importSucceeded = true;
            } catch (err: any) {
                lastError = err.message;
                logger.error({ err }, 'Fallback mysql2 import failed');
            }
        }

        // Cleanup uploaded temp file
        try {
            await fs.unlink(filePath);
        } catch {}

        if (!importSucceeded) {
            throw new HttpError(
                500,
                `Gagal mengimpor database: ${lastError}`,
                'DATABASE_IMPORT_FAILED',
                true,
            );
        }

        return {
            success: true,
            message:
                'Database berhasil dipulihkan secara penuh beserta seluruh data dan relasi tabel.',
        };
    }

    async exportUploads(): Promise<string> {
        if (!existsSync(this.uploadsDir)) {
            await fs.mkdir(this.uploadsDir, { recursive: true });
        }

        const outputPath = path.join(os.tmpdir(), `ems-uploads-backup-${Date.now()}.zip`);
        const zip = new AdmZip();

        const files = await fs.readdir(this.uploadsDir);
        for (const file of files) {
            if (file === '.gitignore') continue;
            const fullPath = path.join(this.uploadsDir, file);
            try {
                const stat = await fs.stat(fullPath);
                if (stat.isFile()) {
                    zip.addLocalFile(fullPath);
                } else if (stat.isDirectory()) {
                    zip.addLocalFolder(fullPath, file);
                }
            } catch (err) {
                logger.warn({ err, file }, 'Skipping file during zip archive');
            }
        }

        zip.writeZip(outputPath);
        return outputPath;
    }

    async importUploads(
        filePath: string,
    ): Promise<{ success: boolean; message: string; count: number }> {
        if (!existsSync(filePath)) {
            throw new HttpError(400, 'File ZIP tidak ditemukan', 'FILE_NOT_FOUND', true);
        }

        if (!existsSync(this.uploadsDir)) {
            await fs.mkdir(this.uploadsDir, { recursive: true });
        }

        let zip: AdmZip;
        try {
            zip = new AdmZip(filePath);
        } catch {
            throw new HttpError(
                400,
                'Format file bukan arsip ZIP yang valid',
                'INVALID_ZIP_FILE',
                true,
            );
        }

        const entries = zip.getEntries();
        let extractedCount = 0;

        for (const entry of entries) {
            if (entry.isDirectory) continue;

            // Zip Slip protection: ensure entry does not escape uploads directory
            const targetPath = path.resolve(this.uploadsDir, entry.entryName);
            if (!targetPath.startsWith(this.uploadsDir)) {
                logger.warn({ entry: entry.entryName }, 'Potential Zip Slip attempt blocked');
                continue;
            }

            // Extract file
            const dir = path.dirname(targetPath);
            if (!existsSync(dir)) {
                await fs.mkdir(dir, { recursive: true });
            }
            await fs.writeFile(targetPath, entry.getData());
            extractedCount++;
        }

        // Cleanup uploaded zip file
        try {
            await fs.unlink(filePath);
        } catch {}

        return {
            success: true,
            message: `Berhasil memulihkan ${extractedCount} berkas ke folder uploads.`,
            count: extractedCount,
        };
    }
}
