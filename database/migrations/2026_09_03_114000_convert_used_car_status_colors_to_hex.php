<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  public function up(): void
  {
    $map = [
      'success' => '#52C41A',
      'red' => '#F5222D',
      'yellow' => '#FAE100',
      'warning' => '#FA8C16',
      'primary' => '#2F54EB',
      'blue' => '#1677FF',
      'white' => '#FFFFFF',
      'black' => '#000000',
    ];

    $rows = DB::table('used_car_statuses')->get(['id', 'color', 'text_color']);

    foreach ($rows as $row) {
      $color = $row->color;
      $textColor = $row->text_color;

      if (is_string($color) && isset($map[mb_strtolower($color)])) {
        $color = $map[mb_strtolower($color)];
      }

      if (is_string($textColor) && isset($map[mb_strtolower($textColor)])) {
        $textColor = $map[mb_strtolower($textColor)];
      }

      DB::table('used_car_statuses')->where('id', $row->id)->update([
        'color' => $color,
        'text_color' => $textColor,
      ]);
    }
  }

  public function down(): void
  {
    // Обратный маппинг не нужен — значения уже в hex.
  }
};
