import type { AppThemeConfig, IThemeRepository, IThemeService } from './theme.interface';

export const DEFAULT_BANYAN_THEME: AppThemeConfig = {
    preset: 'banyan',
    themeName: 'BANYAN Official',
    colors: {
        primary: '#0F3B82',
        primaryForeground: '#FFFFFF',
        brandFrom: '#0F3B82',
        brandTo: '#1D54B2',
        secondary: '#F0F4FA',
        accent: '#E6EFFD',
        destructive: '#D64545',
        destructiveForeground: '#FFFFFF',
        warning: '#F4B400',
        warningForeground: '#2A1F00',
        info: '#1E7B85',
        infoForeground: '#FFFFFF',
        success: '#16A34A',
        successForeground: '#FFFFFF',
        background: '',
        card: '',
        sidebar: '',
        sidebarPrimary: '#0F3B82',
    },
    radius: '0.25rem',
    radiusScale: 'sm',
    buttonStyle: 'gradient',
    shadowStyle: 'soft',
    fontFamily: 'plus-jakarta',
    logo: {
        url: '',
        darkUrl: '',
        text: 'BANYAN',
        subtitle: 'Bimbel Management',
        type: 'image_text',
        iconName: 'mdi:school',
        hasBorder: false,
        borderWidth: 1,
        borderColor: '',
        borderStyle: 'solid',
        borderRadius: 'inherit',
        padding: 0,
        hasBackground: false,
        backgroundColor: 'transparent',
        aspectRatio: 'square',
        imageFit: 'contain',
    },
};

export class ThemeService implements IThemeService {
    constructor(private readonly repository: IThemeRepository) {}

    async getTheme(id = 'default'): Promise<AppThemeConfig> {
        const theme = await this.repository.getTheme(id);
        if (!theme || !theme.config) {
            return DEFAULT_BANYAN_THEME;
        }
        return {
            ...DEFAULT_BANYAN_THEME,
            ...theme.config,
            colors: {
                ...DEFAULT_BANYAN_THEME.colors,
                ...theme.config.colors,
            },
            logo: {
                ...DEFAULT_BANYAN_THEME.logo,
                ...(theme.config.logo ?? {}),
            },
        };
    }

    async updateTheme(
        themeConfig: Partial<AppThemeConfig>,
        userId?: number | null,
    ): Promise<AppThemeConfig> {
        const current = await this.getTheme();
        const merged: AppThemeConfig = {
            ...current,
            ...themeConfig,
            preset: themeConfig.preset ?? current.preset ?? 'custom',
            themeName: themeConfig.themeName ?? current.themeName ?? 'Custom Theme',
            colors: {
                ...current.colors,
                ...(themeConfig.colors ?? {}),
            },
            radius: themeConfig.radius ?? current.radius ?? '0.25rem',
            radiusScale: themeConfig.radiusScale ?? current.radiusScale ?? 'sm',
            buttonStyle: themeConfig.buttonStyle ?? current.buttonStyle ?? 'gradient',
            shadowStyle: themeConfig.shadowStyle ?? current.shadowStyle ?? 'soft',
            fontFamily: themeConfig.fontFamily ?? current.fontFamily ?? 'plus-jakarta',
            logo: {
                ...current.logo,
                ...(themeConfig.logo ?? {}),
            },
        };

        const saved = await this.repository.saveTheme('default', merged.themeName, merged, userId);
        return saved.config;
    }

    async resetTheme(userId?: number | null): Promise<AppThemeConfig> {
        await this.repository.resetTheme('default');
        return DEFAULT_BANYAN_THEME;
    }
}
