<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('auto_marks', function (Blueprint $table) {
      $table->unsignedInteger('ordering')->nullable()->default(null)->change();
    });

    Schema::table('auto_models', function (Blueprint $table) {
      $table->unsignedInteger('ordering')->nullable()->default(null)->change();
    });

    DB::table('auto_marks')->where('ordering', 0)->update(['ordering' => null]);
    DB::table('auto_models')->where('ordering', 0)->update(['ordering' => null]);
  }

  public function down(): void
  {
    DB::table('auto_marks')->whereNull('ordering')->update(['ordering' => 0]);
    DB::table('auto_models')->whereNull('ordering')->update(['ordering' => 0]);

    Schema::table('auto_marks', function (Blueprint $table) {
      $table->unsignedInteger('ordering')->default(0)->nullable(false)->change();
    });

    Schema::table('auto_models', function (Blueprint $table) {
      $table->unsignedInteger('ordering')->default(0)->nullable(false)->change();
    });
  }
};
