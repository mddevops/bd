<?php

namespace App\Enums;

enum UsedCarServiceType: string
{
  case Body = 'body';
  case Painting = 'painting';
  case Locksmith = 'locksmith';
  case Electric = 'electric';
  case Others = 'others';
  case DryCleaning = 'dry_cleaning';
  case Polishing = 'polishing';
  case Mileage = 'mileage';
  case Windshield = 'windshield';
  case Preparation = 'preparation';

  public function label(): string
  {
    return match ($this) {
      self::Body => 'Кузовные работы',
      self::Painting => 'Малярные работы',
      self::Locksmith => 'Слесарные работы',
      self::Electric => 'Электроника',
      self::Others => 'Прочие работы',
      self::DryCleaning => 'Химчистка',
      self::Polishing => 'Полировка',
      self::Mileage => 'Пробег',
      self::Windshield => 'Лобовое',
      self::Preparation => 'Подготовка',
    };
  }

  /**
   * @return list<array{value: string, label: string}>
   */
  public static function options(): array
  {
    return array_map(
      fn (self $case) => ['value' => $case->value, 'label' => $case->label()],
      self::cases(),
    );
  }
}
