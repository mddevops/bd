export interface LogoThemeStyle {
    background: string;
    size: number;
    color: string;
}

export interface LogoStyleSettings {
    light: LogoThemeStyle;
    dark: LogoThemeStyle;
}

export const DEFAULT_LOGO_SIZE = 32;

export const LOGO_SIZE_OPTIONS = [24, 28, 32, 36, 40, 48, 56, 64] as const;

export function defaultLogoThemeStyle(): LogoThemeStyle {
    return {
        background: '',
        size: DEFAULT_LOGO_SIZE,
        color: '',
    };
}

export function defaultLogoStyle(): LogoStyleSettings {
    return {
        light: defaultLogoThemeStyle(),
        dark: defaultLogoThemeStyle(),
    };
}

export function normalizeLogoStyle(value: Partial<LogoStyleSettings> | null | undefined): LogoStyleSettings {
    const defaults = defaultLogoStyle();

    return {
        light: normalizeLogoTheme(value?.light, defaults.light),
        dark: normalizeLogoTheme(value?.dark, defaults.dark),
    };
}

function normalizeLogoTheme(
    value: Partial<LogoThemeStyle> | null | undefined,
    defaults: LogoThemeStyle,
): LogoThemeStyle {
    const size = Number(value?.size ?? defaults.size);

    return {
        background: normalizeHex(value?.background ?? ''),
        size: Number.isFinite(size) ? Math.min(96, Math.max(16, Math.round(size))) : defaults.size,
        color: normalizeHex(value?.color ?? ''),
    };
}

export function normalizeHex(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        return '';
    }

    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
        return '';
    }

    return trimmed.toUpperCase();
}
