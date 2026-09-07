<?php

namespace App\Support;

/**
 * Правила загрузки изображений каталога.
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
    public const EXTENSIONS = [
        'jpg',
        'jpeg',
        'png',
        'webp',
    ];

    /**
     * Правила валидации загружаемого файла (без ограничения размера).
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

    public static function mimeTypesString(): string
    {
        return implode(',', self::MIME_TYPES);
    }

    public static function acceptAttribute(): string
    {
        return self::mimeTypesString();
    }
}
