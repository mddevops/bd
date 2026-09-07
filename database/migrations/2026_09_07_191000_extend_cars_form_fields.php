<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('cars', function (Blueprint $table) {
      if (! Schema::hasColumn('cars', 'interior_type_id')) {
        $table->foreignId('interior_type_id')->nullable()->after('color')->constrained('interior_types')->nullOnDelete();
      }

      if (! Schema::hasColumn('cars', 'avito_url')) {
        $table->string('avito_url', 500)->nullable()->after('link');
      }

      if (! Schema::hasColumn('cars', 'autoteka_url')) {
        $table->string('autoteka_url', 350)->nullable()->after('avito_url');
      }

      if (! Schema::hasColumn('cars', 'repair_cost')) {
        $table->unsignedInteger('repair_cost')->nullable()->after('transport_cost');
      }

      if (! Schema::hasColumn('cars', 'deregistration_cost')) {
        $table->unsignedInteger('deregistration_cost')->nullable()->after('repair_cost');
      }
    });

    if (Schema::hasColumn('cars', 'link') && Schema::hasColumn('cars', 'avito_url')) {
      DB::table('cars')
        ->whereNotNull('link')
        ->where(function ($query) {
          $query->whereNull('avito_url')->orWhere('avito_url', '');
        })
        ->update([
          'avito_url' => DB::raw('link'),
        ]);
    }
  }

  public function down(): void
  {
    Schema::table('cars', function (Blueprint $table) {
      if (Schema::hasColumn('cars', 'interior_type_id')) {
        $table->dropConstrainedForeignId('interior_type_id');
      }

      foreach (['avito_url', 'autoteka_url', 'repair_cost', 'deregistration_cost'] as $column) {
        if (Schema::hasColumn('cars', $column)) {
          $table->dropColumn($column);
        }
      }
    });
  }
};
