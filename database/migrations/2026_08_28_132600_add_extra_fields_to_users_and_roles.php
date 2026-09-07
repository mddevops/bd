<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->boolean('aktiven')->default(true)->after('password');
    });

    Schema::table('roles', function (Blueprint $table) {
      $table->string('otobrazhaemoe_imya')->nullable()->after('name');
      $table->text('opisanie')->nullable()->after('otobrazhaemoe_imya');
    });
  }

  public function down(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->dropColumn('aktiven');
    });

    Schema::table('roles', function (Blueprint $table) {
      $table->dropColumn(['otobrazhaemoe_imya', 'opisanie']);
    });
  }
};
