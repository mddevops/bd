<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('system_settings', function (Blueprint $table) {
      if (! Schema::hasColumn('system_settings', 'logo_style')) {
        $table->json('logo_style')->nullable()->after('logo_path');
      }
    });
  }

  public function down(): void
  {
    Schema::table('system_settings', function (Blueprint $table) {
      if (Schema::hasColumn('system_settings', 'logo_style')) {
        $table->dropColumn('logo_style');
      }
    });
  }
};
