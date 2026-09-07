<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('auto_marks', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('name_ru')->nullable();
      $table->string('url')->unique();
      $table->string('logo_min')->nullable();
      $table->string('logo_big')->nullable();
      $table->string('country')->nullable();
      $table->boolean('status')->default(true);
    });

    Schema::create('auto_models', function (Blueprint $table) {
      $table->id();
      $table->foreignId('mark_id')->constrained('auto_marks')->cascadeOnDelete();
      $table->string('name');
      $table->string('name_ru')->nullable();
      $table->string('url');
      $table->string('class')->nullable();
      $table->unsignedSmallInteger('year_from')->nullable();
      $table->unsignedSmallInteger('year_to')->nullable();
      $table->foreignId('parent_id')->nullable()->constrained('auto_models')->nullOnDelete();
      $table->boolean('status')->default(true);

      $table->unique(['mark_id', 'url']);
    });

    Schema::create('auto_generations', function (Blueprint $table) {
      $table->id();
      $table->foreignId('model_id')->constrained('auto_models')->cascadeOnDelete();
      $table->string('name');
      $table->unsignedSmallInteger('year_from')->nullable();
      $table->unsignedSmallInteger('year_to')->nullable();
    });

    Schema::create('auto_series', function (Blueprint $table) {
      $table->id();
      $table->foreignId('model_id')->constrained('auto_models')->cascadeOnDelete();
      $table->foreignId('generation_id')->constrained('auto_generations')->cascadeOnDelete();
      $table->string('name');
      $table->string('url');
      $table->string('image')->nullable();
      $table->boolean('status')->default(true);

      $table->unique(['generation_id', 'url']);
    });

    Schema::create('auto_modifications', function (Blueprint $table) {
      $table->id();
      $table->foreignId('series_id')->constrained('auto_series')->cascadeOnDelete();
      $table->string('name');
      $table->decimal('engine_volume', 3, 1)->nullable();
      $table->unsignedSmallInteger('engine_power')->nullable();
      $table->string('engine')->nullable();
      $table->string('transmission')->nullable();
      $table->string('drive')->nullable();
      $table->decimal('consumption_100_km', 4, 1)->nullable();
      $table->decimal('acceleration_0_100', 4, 1)->nullable();
      $table->boolean('status')->default(true);
    });

    Schema::create('auto_equipments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('series_id')->constrained('auto_series')->cascadeOnDelete();
      $table->foreignId('modification_id')->constrained('auto_modifications')->cascadeOnDelete();
      $table->string('name');
      $table->boolean('status')->default(true);
    });

    Schema::create('auto_characteristics', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->foreignId('parent_id')->nullable()->constrained('auto_characteristics')->nullOnDelete();
      $table->unsignedInteger('sort')->default(0);
    });

    Schema::create('auto_characteristic_values', function (Blueprint $table) {
      $table->id();
      $table->foreignId('equipment_id')->constrained('auto_equipments')->cascadeOnDelete();
      $table->foreignId('characteristic_id')->constrained('auto_characteristics')->cascadeOnDelete();
      $table->string('value')->nullable();
      $table->string('unit')->nullable();

      $table->unique(['equipment_id', 'characteristic_id']);
    });

    Schema::create('auto_options', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->foreignId('parent_id')->nullable()->constrained('auto_options')->nullOnDelete();
      $table->unsignedInteger('sort')->default(0);
    });

    Schema::create('auto_option_values', function (Blueprint $table) {
      $table->id();
      $table->foreignId('option_id')->constrained('auto_options')->cascadeOnDelete();
      $table->foreignId('equipment_id')->constrained('auto_equipments')->cascadeOnDelete();
      $table->boolean('is_base')->default(false);

      $table->unique(['option_id', 'equipment_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('auto_option_values');
    Schema::dropIfExists('auto_options');
    Schema::dropIfExists('auto_characteristic_values');
    Schema::dropIfExists('auto_characteristics');
    Schema::dropIfExists('auto_equipments');
    Schema::dropIfExists('auto_modifications');
    Schema::dropIfExists('auto_series');
    Schema::dropIfExists('auto_generations');
    Schema::dropIfExists('auto_models');
    Schema::dropIfExists('auto_marks');
  }
};
