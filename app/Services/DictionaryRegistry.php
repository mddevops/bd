<?php

namespace App\Services;

use InvalidArgumentException;

class DictionaryRegistry
{
  /**
   * @return array<string, array<string, mixed>>
   */
  public static function all(): array
  {
    return config('dictionaries.items', []);
  }

  /**
   * @return list<array{type: string, label: string}>
   */
  public static function menu(): array
  {
    return collect(self::all())
      ->map(fn (array $item, string $type) => [
        'type' => $type,
        'label' => $item['label'],
      ])
      ->values()
      ->all();
  }

  /**
   * @return array<string, mixed>
   */
  public static function get(string $type): array
  {
    $item = self::all()[$type] ?? null;

    if (! $item) {
      throw new InvalidArgumentException("Unknown dictionary type: {$type}");
    }

    return $item + [
      'type' => $type,
      'primary_key' => $item['primary_key'] ?? 'id',
      'name_column' => $item['name_column'] ?? 'name',
      'sortable' => (bool) ($item['sortable'] ?? false),
      'default_sort' => $item['default_sort'] ?? (
        ($item['sortable'] ?? false) ? ['ordering', 'asc'] : [($item['name_column'] ?? 'name'), 'asc']
      ),
    ];
  }

  public static function model(string $type): string
  {
    return self::get($type)['model'];
  }
}
