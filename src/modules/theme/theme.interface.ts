import type { Request, Response, NextFunction } from 'express';

export interface ThemeColors {
    primary: string;
    primaryForeground: string;
    brandFrom: string;
    brandTo: string;
    secondary?: string;
    accent?: string;
    destructive: string;
    destructiveForeground: string;
    warning: string;
    warningForeground: string;
    info: string;
    infoForeground: string;
    success: string;
    successForeground: string;
    background?: string;
    card?: string;
    sidebar?: string;
    sidebarPrimary?: string;
}

export interface AppThemeConfig {
    preset: string;
    themeName: string;
    colors: ThemeColors;
    radius: string; // e.g. "0px", "0.25rem", "0.375rem", "0.5rem", "0.75rem", "1rem"
    radiusScale: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    buttonStyle: 'gradient' | 'solid' | 'soft' | 'outline';
    shadowStyle: 'none' | 'soft' | 'medium' | 'strong';
    fontFamily: string;
}

export interface AppThemeEntity {
    id: string;
    theme_name: string;
    config: AppThemeConfig;
    updated_by?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface IThemeRepository {
    getTheme(id?: string): Promise<AppThemeEntity | null>;
    saveTheme(
        id: string,
        themeName: string,
        config: AppThemeConfig,
        updatedBy?: number | null,
    ): Promise<AppThemeEntity>;
    resetTheme(id?: string): Promise<void>;
}

export interface IThemeService {
    getTheme(id?: string): Promise<AppThemeConfig>;
    updateTheme(
        themeConfig: Partial<AppThemeConfig>,
        userId?: number | null,
    ): Promise<AppThemeConfig>;
    resetTheme(userId?: number | null): Promise<AppThemeConfig>;
}

export interface IThemeController {
    getTheme: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateTheme: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetTheme: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
