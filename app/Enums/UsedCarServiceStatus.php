<?php

namespace App\Enums;

enum UsedCarServiceStatus: int
{
  case Empty = 0;
  case Repair = 1;
  case Ready = 2;
  case NotRequired = 3;

  public function label(): string
  {
    return match ($this) {
      self::Empty => '—',
      self::Repair => 'Ремонт',
      self::Ready => 'Готов',
      self::NotRequired => 'Не требуется',
    };
  }

  /**
   * @return list<array{value: int, label: string}>
   */
  public static function options(): array
  {
    return array_values(array_filter(
      array_map(
        fn (self $case) => $case === self::Empty
          ? null
          : ['value' => $case->value, 'label' => $case->label()],
        self::cases(),
      ),
    ));
  }
}
