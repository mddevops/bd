<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    if (! Schema::hasColumn('colors', 'hex')) {
      Schema::table('colors', function (Blueprint $table) {
        $table->string('hex', 7)->nullable()->after('name');
      });
    }

    if (Schema::hasColumn('colors', 'comment')) {
      Schema::table('colors', function (Blueprint $table) {
        $table->dropColumn('comment');
      });
    }

    if (Schema::hasTable('used_cars')) {
      DB::table('used_cars')->update(['color_id' => null]);
    }

    DB::table('colors')->delete();

    $now = now();
    $rows = [
      ['id' => 1, 'name' => 'Черный', 'hex' => '#000000', 'ordering' => 1],
      ['id' => 2, 'name' => 'Серебристый', 'hex' => '#D9D9D9', 'ordering' => 2],
      ['id' => 3, 'name' => 'Белый', 'hex' => '#FFFFFF', 'ordering' => 3],
      ['id' => 4, 'name' => 'Серый', 'hex' => '#8C8C8C', 'ordering' => 4],
      ['id' => 5, 'name' => 'Синий', 'hex' => '#2F54EB', 'ordering' => 5],
      ['id' => 6, 'name' => 'Красный', 'hex' => '#F5222D', 'ordering' => 6],
      ['id' => 7, 'name' => 'Зеленый', 'hex' => '#52C41A', 'ordering' => 7],
      ['id' => 8, 'name' => 'Коричневый', 'hex' => '#8B4513', 'ordering' => 8],
      ['id' => 9, 'name' => 'Бежевый', 'hex' => '#EAD7B7', 'ordering' => 9],
      ['id' => 10, 'name' => 'Голубой', 'hex' => '#40A9FF', 'ordering' => 10],
      ['id' => 11, 'name' => 'Золотистый', 'hex' => '#FFD700', 'ordering' => 11],
      ['id' => 12, 'name' => 'Пурпурный', 'hex' => '#B037FF', 'ordering' => 12],
      ['id' => 13, 'name' => 'Фиолетовый', 'hex' => '#9254DE', 'ordering' => 13],
      ['id' => 14, 'name' => 'Желтый', 'hex' => '#FAE100', 'ordering' => 14],
      ['id' => 15, 'name' => 'Оранжевый', 'hex' => '#FFA940', 'ordering' => 15],
      ['id' => 16, 'name' => 'Розовый', 'hex' => '#FFB6C1', 'ordering' => 16],
    ];

    foreach ($rows as $row) {
      DB::table('colors')->insert($row + [
        'created_at' => $now,
        'updated_at' => $now,
      ]);
    }

    DB::statement('ALTER TABLE colors MODIFY hex VARCHAR(7) NOT NULL');
    DB::statement('ALTER TABLE colors AUTO_INCREMENT = 17');
  }

  public function down(): void
  {
    Schema::table('colors', function (Blueprint $table) {
      if (Schema::hasColumn('colors', 'hex')) {
        $table->dropColumn('hex');
      }

      if (! Schema::hasColumn('colors', 'comment')) {
        $table->string('comment', 200)->nullable()->after('name');
      }
    });
  }
};
