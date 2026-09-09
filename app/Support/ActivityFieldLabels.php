<?php

namespace App\Support;

final class ActivityFieldLabels
{
  /**
   * @return array<string, string>
   */
  public static function forCars(): array
  {
    return [
      'showroom_id' => 'Салон',
      'link' => 'Ссылка',
      'avito_url' => 'Ссылка Авито',
      'autoteka_url' => 'Ссылка Автотека',
      'arrival_date' => 'Дата поступления',
      'mark_id' => 'Марка',
      'model_id' => 'Модель',
      'year' => 'Год',
      'complectation' => 'Комплектация',
      'body_type_id' => 'Кузов',
      'transmission_id' => 'КПП',
      'engine_type_id' => 'Тип двигателя',
      'wheel_type_id' => 'Привод',
      'power' => 'Мощность',
      'salon' => 'Салон (текст)',
      'color' => 'Цвет',
      'interior_type_id' => 'Салон (отделка)',
      'engine_volume' => 'Объём двигателя',
      'vin' => 'VIN',
      'body_number' => 'Номер кузова',
      'pts_type' => 'Тип ПТС',
      'price' => 'Цена закупки',
      'transport_cost' => 'Автовоз',
      'repair_cost' => 'Ремонт',
      'deregistration_cost' => 'Снятие с учёта',
      'sale_price' => 'Цена продажи',
      'sell_out' => 'Sell-out',
      'supplier' => 'Поставщик',
      'avito_price' => 'Продажа Авито',
      'key_number' => 'Номер ключа',
      'status_id' => 'Статус',
      'transit' => 'Транзит',
      'manager_id' => 'Менеджер',
      'comment' => 'Комментарий',
      'direct' => 'Direct',
    ];
  }

  /**
   * @return array<string, string>
   */
  public static function forUsedCars(): array
  {
    return [
      'showroom_id' => 'Салон',
      'arrival_date' => 'Дата поступления',
      'mark_id' => 'Марка',
      'model_id' => 'Модель',
      'year' => 'Год',
      'body_type_id' => 'Кузов',
      'transmission_id' => 'КПП',
      'engine_type_id' => 'Тип двигателя',
      'wheel_type_id' => 'Привод',
      'color' => 'Цвет',
      'interior_type_id' => 'Салон (отделка)',
      'owner_count' => 'Владельцев',
      'power' => 'Мощность',
      'mileage' => 'Пробег',
      'engine_volume' => 'Объём двигателя',
      'vin' => 'VIN',
      'license_plate' => 'Госномер',
      'sts_number' => 'Номер СТС',
      'pts_type' => 'Тип ПТС',
      'is_registered' => 'На учёте',
      'key_number' => 'Номер ключа',
      'legal_entity' => 'Юр. лицо',
      'service_book' => 'Сервисная книжка',
      'is_trade_in' => 'Trade-in',
      'status_id' => 'Статус',
      'manager_id' => 'Менеджер',
      'purchase_price' => 'Цена закупки',
      'sale_price' => 'Цена продажи',
      'avito_price' => 'Продажа Авито',
      'repair_cost' => 'Ремонт',
      'transport_cost' => 'Автовоз',
      'deregistration_cost' => 'Снятие с учёта',
      'avito_url' => 'Ссылка Авито',
      'autoteka_url' => 'Ссылка Автотека',
      'sale_type' => 'Тип продажи',
      'comment' => 'Комментарий',
      'pictures' => 'Фото',
    ];
  }
}
