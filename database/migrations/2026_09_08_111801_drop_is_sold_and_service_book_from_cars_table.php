<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('cars', function (Blueprint $table) {
      if (Schema::hasColumn('cars', 'is_sold')) {
        $table->dropColumn('is_sold');
      }

      if (Schema::hasColumn('cars', 'service_book')) {
        $table->dropColumn('service_book');
      }
    });
  }

  public function down(): void
  {
    Schema::table('cars', function (Blueprint $table) {
      if (! Schema::hasColumn('cars', 'is_sold')) {
        $table->boolean('is_sold')->nullable();
      }

      if (! Schema::hasColumn('cars', 'service_book')) {
        $table->boolean('service_book')->nullable();
      }
    });
  }
};
