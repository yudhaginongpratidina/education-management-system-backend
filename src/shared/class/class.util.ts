// Shared helpers for the class domain modules.

// MySQL TIME columns return 'HH:MM:SS'; normalize user input so comparisons are stable.
export const normalizeTime = (time?: string | null): string | null => {
    if (!time) return time ?? null;
    const [hh = '00', mm = '00', ss = '00'] = time.split(':');
    return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`;
};

// DATE value (YYYY-MM-DD) for "today".
export const today = (): string => new Date().toISOString().slice(0, 10);

// Translate raw database integrity errors so they never reach the client.
export const isDuplicateEntryError = (error: any): boolean => {
    const code = error?.code ?? error?.errno;
    return code === 'ER_DUP_ENTRY' || code === 1062 || code === '23505';
};

export const isForeignKeyConstraintError = (error: any): boolean => {
    const code = error?.code ?? error?.errno;
    return (
        code === 'ER_ROW_IS_REFERENCED_2' ||
        code === 'ER_NO_REFERENCED_ROW_2' ||
        code === 1451 ||
        code === 1452 ||
        code === '23503'
    );
};
