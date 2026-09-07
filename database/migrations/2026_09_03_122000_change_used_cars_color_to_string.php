<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('used_cars', function (Blueprint $table) {
      if (! Schema::hasColumn('used_cars', 'color')) {
        $table->string('color', 150)->nullable()->after('wheel_type_id');
      }
    });

    if (Schema::hasColumn('used_cars', 'color_id')) {
      $rows = DB::table('used_cars')
        ->whereNotNull('color_id')
        ->get(['id', 'color_id']);

      foreach ($rows as $row) {
        $name = DB::table('colors')->where('id', $row->color_id)->value('name');
        if ($name) {
          DB::table('used_cars')->where('id', $row->id)->update(['color' => $name]);
        }
      }

      Schema::table('used_cars', function (Blueprint $table) {
        $table->dropConstrainedForeignId('color_id');
      });
    }
  }

  public function down(): void
  {
    Schema::table('used_cars', function (Blueprint $table) {
      if (! Schema::hasColumn('used_cars', 'color_id')) {
        $table->foreignId('color_id')->nullable()->after('wheel_type_id')->constrained('colors')->nullOnDelete();
      }
    });

    if (Schema::hasColumn('used_cars', 'color')) {
      Schema::table('used_cars', function (Blueprint $table) {
        $table->dropColumn('color');
      });
    }
  }
};
