/** MIME-типы изображений каталога: JPG, PNG, WebP. Размер не ограничиваем. */
export const CATALOG_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Значение для атрибута accept у input[type=file]. */
export const CATALOG_IMAGE_ACCEPT = CATALOG_IMAGE_MIME_TYPES.join(',');

export function isCatalogImageFile(file: File): boolean {
    return (CATALOG_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
}
