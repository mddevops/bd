<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('system_settings', function (Blueprint $table) {
      $table->boolean('activity_log_view_enabled')->default(true)->after('module_dictionaries_enabled');
      $table->boolean('activity_log_update_enabled')->default(true)->after('activity_log_view_enabled');
      $table->boolean('activity_log_delete_enabled')->default(true)->after('activity_log_update_enabled');
      $table->boolean('activity_log_restore_enabled')->default(true)->after('activity_log_delete_enabled');
    });
  }

  public function down(): void
  {
    Schema::table('system_settings', function (Blueprint $table) {
      $table->dropColumn([
        'activity_log_view_enabled',
        'activity_log_update_enabled',
        'activity_log_delete_enabled',
        'activity_log_restore_enabled',
      ]);
    });
  }
};
