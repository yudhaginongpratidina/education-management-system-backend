import { z } from 'zod';

const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$|^$/;

export const updateThemeSchema = z.object({
    body: z.object({
        preset: z.string().optional().default('custom'),
        themeName: z.string().min(1).max(100).optional().default('Custom Theme'),
        colors: z
            .object({
                primary: z.string().regex(colorRegex, 'Invalid hex color'),
                primaryForeground: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                brandFrom: z.string().regex(colorRegex, 'Invalid hex color'),
                brandTo: z.string().regex(colorRegex, 'Invalid hex color'),
                secondary: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                accent: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                destructive: z.string().regex(colorRegex, 'Invalid hex color'),
                destructiveForeground: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                warning: z.string().regex(colorRegex, 'Invalid hex color'),
                warningForeground: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                info: z.string().regex(colorRegex, 'Invalid hex color'),
                infoForeground: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                success: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                successForeground: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                background: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                card: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                sidebar: z.string().regex(colorRegex, 'Invalid hex color').optional(),
                sidebarPrimary: z.string().regex(colorRegex, 'Invalid hex color').optional(),
            })
            .passthrough(),
        radius: z.string().min(1).max(20).optional().default('0.25rem'),
        radiusScale: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional().default('sm'),
        buttonStyle: z.enum(['gradient', 'solid', 'soft', 'outline']).optional().default('gradient'),
        shadowStyle: z.enum(['none', 'soft', 'medium', 'strong']).optional().default('soft'),
        fontFamily: z.string().min(1).max(50).optional().default('plus-jakarta'),
    }),
});
