export interface DatabaseStats {
    databaseName: string;
    totalTables: number;
    totalRows: number;
    sizeBytes: number;
    sizeFormatted: string;
}

export interface UploadsStats {
    totalFiles: number;
    sizeBytes: number;
    sizeFormatted: string;
}

export interface BackupStatus {
    database: DatabaseStats;
    uploads: UploadsStats;
    timestamp: string;
}

export interface IBackupService {
    getStatus(): Promise<BackupStatus>;
    exportDatabase(): Promise<string>;
    importDatabase(filePath: string): Promise<{ success: boolean; message: string; details?: any }>;
    exportUploads(): Promise<string>;
    importUploads(filePath: string): Promise<{ success: boolean; message: string; count: number }>;
}
