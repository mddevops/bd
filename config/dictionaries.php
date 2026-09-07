<?php

return [

  /*
  |--------------------------------------------------------------------------
  | Справочники CRM
  |--------------------------------------------------------------------------
  |
  | Единый реестр для раздела «Справочники».
  | type — ключ URL /dictionaries/{type}
  | sortable — drag-and-drop порядок (кроме стран)
  |
  */

  'items' => [
    'body-types' => [
      'label' => 'Типы кузова',
      'model' => App\Models\Dictionaries\BodyType::class,
      'table' => 'body_types',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'slug' => ['label' => 'Slug', 'type' => 'text', 'required' => true],
        'comment' => ['label' => 'Комментарий', 'type' => 'text', 'required' => false],
      ],
    ],
    'colors' => [
      'label' => 'Цвета',
      'model' => App\Models\Dictionaries\Color::class,
      'table' => 'colors',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'hex' => ['label' => 'Код цвета', 'type' => 'color', 'required' => true],
      ],
    ],
    'engine-types' => [
      'label' => 'Типы двигателя',
      'model' => App\Models\Dictionaries\EngineType::class,
      'table' => 'engine_types',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'comment' => ['label' => 'Комментарий', 'type' => 'text', 'required' => false],
      ],
    ],
    'wheel-types' => [
      'label' => 'Типы привода',
      'model' => App\Models\Dictionaries\WheelType::class,
      'table' => 'wheel_types',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'comment' => ['label' => 'Комментарий', 'type' => 'text', 'required' => false],
      ],
    ],
    'transmissions' => [
      'label' => 'КПП',
      'model' => App\Models\Dictionaries\Transmission::class,
      'table' => 'transmissions',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
      ],
    ],
    'used-car-statuses' => [
      'label' => 'Статусы авто с пробегом',
      'model' => App\Models\Dictionaries\UsedCarStatus::class,
      'table' => 'used_car_statuses',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'color' => ['label' => 'Цвет бейджа', 'type' => 'color', 'required' => false],
        'text_color' => ['label' => 'Цвет текста', 'type' => 'color', 'required' => false],
      ],
    ],
    'car-statuses' => [
      'label' => 'Статусы новых авто',
      'model' => App\Models\Dictionaries\CarStatus::class,
      'table' => 'car_statuses',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'color' => ['label' => 'Цвет бейджа', 'type' => 'color', 'required' => false],
        'text_color' => ['label' => 'Цвет текста', 'type' => 'color', 'required' => false],
      ],
    ],
    'showrooms' => [
      'label' => 'Шоурумы',
      'model' => App\Models\Dictionaries\Showroom::class,
      'table' => 'showrooms',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'code' => ['label' => 'Код', 'type' => 'text', 'required' => false],
        'is_active' => ['label' => 'Активен', 'type' => 'boolean', 'required' => false],
      ],
    ],
    'interior-types' => [
      'label' => 'Типы салона',
      'model' => App\Models\Dictionaries\InteriorType::class,
      'table' => 'interior_types',
      'name_column' => 'name',
      'sortable' => true,
      'fields' => [
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
      ],
    ],
    'countries' => [
      'label' => 'Страны',
      'model' => App\Models\Country::class,
      'table' => 'countries',
      'name_column' => 'name',
      'primary_key' => 'code',
      'sortable' => false,
      'fields' => [
        'code' => ['label' => 'Код', 'type' => 'number', 'required' => true],
        'name' => ['label' => 'Название', 'type' => 'text', 'required' => true],
        'fullname' => ['label' => 'Флаг', 'type' => 'text', 'required' => false],
        'alpha2' => ['label' => 'Alpha-2', 'type' => 'text', 'required' => false],
        'alpha3' => ['label' => 'Alpha-3', 'type' => 'text', 'required' => false],
      ],
    ],
  ],

];
