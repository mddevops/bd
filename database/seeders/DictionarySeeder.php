<?php

namespace Database\Seeders;

use App\Models\Dictionaries\BodyType;
use App\Models\Dictionaries\CarStatus;
use App\Models\Dictionaries\Color;
use App\Models\Dictionaries\EngineType;
use App\Models\Dictionaries\InteriorType;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\Transmission;
use App\Models\Dictionaries\UsedCarStatus;
use App\Models\Dictionaries\WheelType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class DictionarySeeder extends Seeder
{
  public function run(): void
  {
    foreach ([
      ['name' => 'Седан', 'slug' => 'sedan'],
      ['name' => 'Хэтчбек', 'slug' => 'hatchback'],
      ['name' => 'Универсал', 'slug' => 'universal'],
      ['name' => 'Лифтбек', 'slug' => 'liftback'],
      ['name' => 'Купе', 'slug' => 'coupe'],
      ['name' => 'Кабриолет', 'slug' => 'cabriolet'],
      ['name' => 'Родстер', 'slug' => 'rodster'],
      ['name' => 'Внедорожник', 'slug' => 'suv'],
      ['name' => 'Кроссовер', 'slug' => 'crossover'],
      ['name' => 'Пикап', 'slug' => 'pickup'],
      ['name' => 'Фургон', 'slug' => 'van'],
      ['name' => 'Минивэн', 'slug' => 'minivan'],
      ['name' => 'Микроавтобус', 'slug' => 'minibus'],
      ['name' => 'Бортовой грузовик', 'slug' => 'bortovoy'],
    ] as $index => $row) {
      BodyType::query()->updateOrCreate(
        ['slug' => $row['slug']],
        $row + ['ordering' => $index + 1],
      );
    }

    foreach ([
      ['id' => 1, 'name' => 'Черный', 'hex' => '#000000'],
      ['id' => 2, 'name' => 'Серебристый', 'hex' => '#D9D9D9'],
      ['id' => 3, 'name' => 'Белый', 'hex' => '#FFFFFF'],
      ['id' => 4, 'name' => 'Серый', 'hex' => '#8C8C8C'],
      ['id' => 5, 'name' => 'Синий', 'hex' => '#2F54EB'],
      ['id' => 6, 'name' => 'Красный', 'hex' => '#F5222D'],
      ['id' => 7, 'name' => 'Зеленый', 'hex' => '#52C41A'],
      ['id' => 8, 'name' => 'Коричневый', 'hex' => '#8B4513'],
      ['id' => 9, 'name' => 'Бежевый', 'hex' => '#EAD7B7'],
      ['id' => 10, 'name' => 'Голубой', 'hex' => '#40A9FF'],
      ['id' => 11, 'name' => 'Золотистый', 'hex' => '#FFD700'],
      ['id' => 12, 'name' => 'Пурпурный', 'hex' => '#B037FF'],
      ['id' => 13, 'name' => 'Фиолетовый', 'hex' => '#9254DE'],
      ['id' => 14, 'name' => 'Желтый', 'hex' => '#FAE100'],
      ['id' => 15, 'name' => 'Оранжевый', 'hex' => '#FFA940'],
      ['id' => 16, 'name' => 'Розовый', 'hex' => '#FFB6C1'],
    ] as $row) {
      Color::query()->updateOrCreate(['id' => $row['id']], [
        'name' => $row['name'],
        'hex' => $row['hex'],
        'ordering' => $row['id'],
      ]);
    }

    $this->seedNamed(EngineType::class, ['Бензин', 'Дизель', 'Электро', 'Гибрид']);
    $this->seedNamed(WheelType::class, ['2WD', '4WD']);
    $this->seedNamed(Transmission::class, ['AT', 'MT']);
    $this->seedNamed(InteriorType::class, ['КОЖА', 'ТКАНЬ', 'АЛЬКАНТАРА', 'КОМБИ']);

    foreach ([
      ['name' => 'В продаже', 'color' => '#52C41A', 'text_color' => '#FFFFFF'],
      ['name' => 'Продан', 'color' => '#F5222D', 'text_color' => '#FFFFFF'],
      ['name' => 'В ремонте', 'color' => '#FAE100', 'text_color' => '#000000'],
      ['name' => 'На подготовке', 'color' => '#FA8C16', 'text_color' => '#FFFFFF'],
      ['name' => 'На выставлении', 'color' => '#2F54EB', 'text_color' => '#FFFFFF'],
      ['name' => 'В продаже (резерв)', 'color' => null, 'text_color' => null],
      ['name' => 'Отложен', 'color' => '#1677FF', 'text_color' => '#FFFFFF'],
    ] as $index => $row) {
      UsedCarStatus::query()->updateOrCreate(
        ['name' => $row['name']],
        $row + ['ordering' => $index + 1],
      );

      CarStatus::query()->updateOrCreate(
        ['name' => $row['name']],
        $row + ['ordering' => $index + 1],
      );
    }

    foreach ([
      ['name' => 'Р1', 'code' => 'R1'],
      ['name' => 'Р3', 'code' => 'R3'],
    ] as $index => $row) {
      Showroom::query()->firstOrCreate(
        ['code' => $row['code']],
        $row + ['is_active' => true, 'ordering' => $index + 1],
      );
    }
  }

  /**
   * @param  class-string<Model>  $modelClass
   * @param  list<string>  $names
   */
  private function seedNamed(string $modelClass, array $names): void
  {
    foreach ($names as $index => $name) {
      $modelClass::query()->firstOrCreate(
        ['name' => $name],
        ['ordering' => $index + 1],
      );
    }
  }
}
