<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('system_settings', function (Blueprint $table) {
      $table->id();
      $table->string('app_name');
      $table->string('logo_path')->nullable();
      $table->string('login_image_path')->nullable();
      $table->boolean('password_reset_enabled')->default(true);
      $table->boolean('maintenance_mode')->default(false);
      $table->boolean('module_catalog_enabled')->default(true);
      $table->boolean('module_users_enabled')->default(true);
      $table->boolean('module_roles_enabled')->default(true);
      $table->boolean('module_panel_enabled')->default(true);
      $table->timestamps();
    });

    DB::table('system_settings')->insert([
      'app_name' => config('app.name'),
      'password_reset_enabled' => true,
      'maintenance_mode' => false,
      'module_catalog_enabled' => true,
      'module_users_enabled' => true,
      'module_roles_enabled' => true,
      'module_panel_enabled' => true,
      'created_at' => now(),
      'updated_at' => now(),
    ]);
  }

  public function down(): void
  {
    Schema::dropIfExists('system_settings');
  }
};
