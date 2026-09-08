import { useEffect, useState } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { type LogoStyleSettings, type LogoThemeStyle, normalizeLogoStyle } from '@/lib/logo-style';
import { cn } from '@/lib/utils';

interface Props {
    logoUrl?: string | null;
    /** Стиль одной темы (если задан forceDark / style). */
    style?: LogoThemeStyle;
    /** Полные настройки — тема выбирается по document / forceDark. */
    logoStyle?: LogoStyleSettings | null;
    className?: string;
    /** Принудительно светлая/тёмная тема превью. */
    forceDark?: boolean;
}

function useDocumentDark(): boolean {
    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
    );

    useEffect(() => {
        const root = document.documentElement;
        const sync = () => setIsDark(root.classList.contains('dark'));
        sync();

        const observer = new MutationObserver(sync);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isDark;
}

export function BrandLogoMark({ logoUrl, style, logoStyle, className, forceDark }: Props) {
    const documentDark = useDocumentDark();
    const isDark = forceDark ?? documentDark;
    const resolvedStyle: LogoThemeStyle =
        style ??
        (isDark ? normalizeLogoStyle(logoStyle).dark : normalizeLogoStyle(logoStyle).light);

    const size = resolvedStyle.size || 32;
    const iconSize = Math.max(12, Math.round(size * 0.625));
    const hasCustomBackground = Boolean(resolvedStyle.background);
    const hasLogoTint = Boolean(resolvedStyle.color);

    return (
        <div
            className={cn(
                'flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-md',
                !hasCustomBackground && 'bg-sidebar-primary text-sidebar-primary-foreground',
                className,
            )}
            style={{
                width: size,
                height: size,
                backgroundColor: resolvedStyle.background || undefined,
                color: resolvedStyle.color || undefined,
            }}
            data-theme={isDark ? 'dark' : 'light'}
        >
            {logoUrl ? (
                hasLogoTint ? (
                    <span
                        aria-hidden
                        className="block size-[70%]"
                        style={{
                            backgroundColor: resolvedStyle.color,
                            WebkitMaskImage: `url(${logoUrl})`,
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskImage: `url(${logoUrl})`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                        }}
                    />
                ) : (
                    <img src={logoUrl} alt="" className="size-full object-contain" />
                )
            ) : (
                <AppLogoIcon
                    className={cn('fill-current', !resolvedStyle.color && 'text-white dark:text-black')}
                    style={{ width: iconSize, height: iconSize }}
                />
            )}
        </div>
    );
}
