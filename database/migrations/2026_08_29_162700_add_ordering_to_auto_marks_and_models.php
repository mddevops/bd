<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('auto_marks', function (Blueprint $table) {
      $table->unsignedInteger('ordering')->default(0)->after('status');
      $table->index('ordering');
    });

    Schema::table('auto_models', function (Blueprint $table) {
      $table->unsignedInteger('ordering')->default(0)->after('status');
      $table->index(['mark_id', 'ordering']);
    });
  }

  public function down(): void
  {
    Schema::table('auto_models', function (Blueprint $table) {
      $table->dropIndex(['mark_id', 'ordering']);
      $table->dropColumn('ordering');
    });

    Schema::table('auto_marks', function (Blueprint $table) {
      $table->dropIndex(['ordering']);
      $table->dropColumn('ordering');
    });
  }
};
