<?php

namespace App\Support;

/**
 * Правила загрузки изображений каталога и брендинга.
 *
 * @see StoresCatalogImages — сохранение на диск public
 */
final class CatalogImage
{
    /** @var list<string> */
    public const MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    /** @var list<string> */
    public const LOGO_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
    ];

    /** @var list<string> */
    public const EXTENSIONS = [
        'jpg',
        'jpeg',
        'png',
        'webp',
    ];

    /** @var list<string> */
    public const LOGO_EXTENSIONS = [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'svg',
    ];

    /**
     * Правила валидации загружаемого файла каталога (без ограничения размера).
     *
     * @return list<string|\Illuminate\Contracts\Validation\ValidationRule>
     */
    public static function uploadRules(): array
    {
        return [
            'nullable',
            'file',
            'mimetypes:'.implode(',', self::MIME_TYPES),
        ];
    }

    /**
     * Правила для логотипа CRM: JPG, PNG, WebP, SVG.
     *
     * @return list<string|\Illuminate\Contracts\Validation\ValidationRule>
     */
    public static function logoUploadRules(): array
    {
        return [
            'nullable',
            'file',
            'mimes:'.implode(',', self::LOGO_EXTENSIONS),
        ];
    }

    public static function mimeTypesString(): string
    {
        return implode(',', self::MIME_TYPES);
    }

    public static function acceptAttribute(): string
    {
        return self::mimeTypesString();
    }

    public static function logoAcceptAttribute(): string
    {
        return implode(',', self::LOGO_MIME_TYPES);
    }
}
