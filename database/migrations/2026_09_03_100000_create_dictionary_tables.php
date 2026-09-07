<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('body_types', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 200);
      $table->string('slug', 100)->unique();
      $table->string('pic', 70)->nullable();
      $table->string('comment', 200)->nullable();
      $table->timestamps();
    });

    Schema::create('colors', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 150);
      $table->string('hex', 7);
      $table->timestamps();
    });

    Schema::create('engine_types', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 200);
      $table->string('comment', 200)->nullable();
      $table->timestamps();
    });

    Schema::create('wheel_types', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 150);
      $table->string('comment', 255)->nullable();
      $table->timestamps();
    });

    Schema::create('transmissions', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name');
      $table->timestamps();
    });

    Schema::create('used_car_statuses', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 100);
      $table->string('color', 100)->nullable();
      $table->string('text_color', 100)->nullable();
      $table->timestamps();
    });

    Schema::create('showrooms', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 150);
      $table->string('code', 50)->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();
    });

    Schema::create('interior_types', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 100);
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('interior_types');
    Schema::dropIfExists('showrooms');
    Schema::dropIfExists('used_car_statuses');
    Schema::dropIfExists('transmissions');
    Schema::dropIfExists('wheel_types');
    Schema::dropIfExists('engine_types');
    Schema::dropIfExists('colors');
    Schema::dropIfExists('body_types');
  }
};
