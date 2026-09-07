<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /** @var list<string> */
  private array $tables = [
    'body_types',
    'colors',
    'engine_types',
    'wheel_types',
    'transmissions',
    'used_car_statuses',
    'showrooms',
    'interior_types',
  ];

  public function up(): void
  {
    foreach ($this->tables as $table) {
      if (! Schema::hasTable($table)) {
        continue;
      }

      if (! Schema::hasColumn($table, 'ordering')) {
        Schema::table($table, function (Blueprint $blueprint) {
          $blueprint->unsignedInteger('ordering')->nullable()->after('id');
        });
      }

      $ids = DB::table($table)->orderBy('id')->pluck('id');
      foreach ($ids as $index => $id) {
        DB::table($table)->where('id', $id)->update(['ordering' => $index + 1]);
      }
    }
  }

  public function down(): void
  {
    foreach ($this->tables as $table) {
      if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'ordering')) {
        continue;
      }

      Schema::table($table, function (Blueprint $blueprint) {
        $blueprint->dropColumn('ordering');
      });
    }
  }
};
