<?php

namespace App\Support;

final class LogoStyle
{
  public const DEFAULT_SIZE = 32;

  /**
   * @return array{light: array{background: string, size: int, color: string}, dark: array{background: string, size: int, color: string}}
   */
  public static function defaults(): array
  {
    $theme = [
      'background' => '',
      'size' => self::DEFAULT_SIZE,
      'color' => '',
    ];

    return [
      'light' => $theme,
      'dark' => $theme,
    ];
  }

  /**
   * @param  mixed  $value
   * @return array{light: array{background: string, size: int, color: string}, dark: array{background: string, size: int, color: string}}
   */
  public static function normalize(mixed $value): array
  {
    $defaults = self::defaults();

    if (! is_array($value)) {
      return $defaults;
    }

    return [
      'light' => self::normalizeTheme($value['light'] ?? null, $defaults['light']),
      'dark' => self::normalizeTheme($value['dark'] ?? null, $defaults['dark']),
    ];
  }

  /**
   * @param  mixed  $value
   * @param  array{background: string, size: int, color: string}  $defaults
   * @return array{background: string, size: int, color: string}
   */
  private static function normalizeTheme(mixed $value, array $defaults): array
  {
    if (! is_array($value)) {
      return $defaults;
    }

    $background = self::normalizeColor($value['background'] ?? '');
    $color = self::normalizeColor($value['color'] ?? '');
    $size = (int) ($value['size'] ?? $defaults['size']);

    if ($size < 16) {
      $size = 16;
    }

    if ($size > 96) {
      $size = 96;
    }

    return [
      'background' => $background,
      'size' => $size,
      'color' => $color,
    ];
  }

  private static function normalizeColor(mixed $value): string
  {
    if (! is_string($value)) {
      return '';
    }

    $value = trim($value);

    if ($value === '') {
      return '';
    }

    if (preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', $value) !== 1) {
      return '';
    }

    return strtoupper($value);
  }
}
