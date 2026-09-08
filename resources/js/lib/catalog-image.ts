/** MIME-типы изображений каталога: JPG, PNG, WebP. Размер не ограничиваем. */
export const CATALOG_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Логотип CRM: каталог + SVG. */
export const BRAND_LOGO_MIME_TYPES = [...CATALOG_IMAGE_MIME_TYPES, 'image/svg+xml'] as const;

/** Значение для атрибута accept у input[type=file]. */
export const CATALOG_IMAGE_ACCEPT = CATALOG_IMAGE_MIME_TYPES.join(',');

export const BRAND_LOGO_ACCEPT = [...BRAND_LOGO_MIME_TYPES, '.svg'].join(',');

export function isCatalogImageFile(file: File): boolean {
    return (CATALOG_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
}

export function isBrandLogoFile(file: File): boolean {
    if ((BRAND_LOGO_MIME_TYPES as readonly string[]).includes(file.type)) {
        return true;
    }

    // Некоторые браузеры отдают пустой MIME для SVG.
    return file.name.toLowerCase().endsWith('.svg');
}
