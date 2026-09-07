<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('used_cars', function (Blueprint $table) {
      $table->id();

      // Идентификация и размещение
      $table->foreignId('showroom_id')->nullable()->constrained('showrooms')->nullOnDelete();
      $table->date('arrival_date')->nullable();
      $table->foreignId('mark_id')->constrained('auto_marks')->restrictOnDelete();
      $table->foreignId('model_id')->constrained('auto_models')->restrictOnDelete();
      $table->unsignedSmallInteger('year')->default(0);

      // Характеристики
      $table->foreignId('body_type_id')->nullable()->constrained('body_types')->nullOnDelete();
      $table->foreignId('transmission_id')->nullable()->constrained('transmissions')->nullOnDelete();
      $table->foreignId('engine_type_id')->nullable()->constrained('engine_types')->nullOnDelete();
      $table->foreignId('wheel_type_id')->nullable()->constrained('wheel_types')->nullOnDelete();
      $table->string('color', 150)->nullable();
      $table->foreignId('interior_type_id')->nullable()->constrained('interior_types')->nullOnDelete();
      $table->unsignedTinyInteger('owner_count')->nullable();
      $table->unsignedInteger('power')->nullable();
      $table->unsignedInteger('mileage')->default(0);
      $table->string('engine_volume', 50)->nullable();

      // Документы
      $table->string('vin', 100)->nullable()->index();
      $table->string('license_plate', 100)->nullable();
      $table->string('sts_number', 100)->nullable();
      $table->unsignedTinyInteger('pts_type')->nullable()->comment('1 — ПТС, 2 — дубликат, 3 — ЭПТС');
      $table->boolean('is_registered')->nullable();
      $table->string('key_number', 100)->nullable();
      $table->string('legal_entity', 150)->nullable();
      $table->boolean('service_book')->nullable();
      $table->boolean('is_trade_in')->default(false);

      // Статус и менеджер
      $table->foreignId('status_id')->nullable()->constrained('used_car_statuses')->nullOnDelete();
      $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();

      // Финансы
      $table->unsignedInteger('purchase_price')->nullable();
      $table->unsignedInteger('sale_price')->default(0);
      $table->unsignedInteger('avito_price')->nullable();
      $table->unsignedInteger('repair_cost')->nullable();
      $table->unsignedInteger('transport_cost')->nullable();
      $table->unsignedInteger('deregistration_cost')->nullable();

      // Ссылки и комментарии
      $table->string('avito_url', 500)->nullable();
      $table->string('autoteka_url', 350)->nullable();
      $table->string('sale_type', 120)->nullable();
      $table->text('comment')->nullable();

      $table->json('pictures')->nullable();
      $table->softDeletes();
      $table->timestamps();

      $table->index(['status_id', 'showroom_id']);
      $table->index(['mark_id', 'model_id']);
    });

    Schema::create('used_car_services', function (Blueprint $table) {
      $table->id();
      $table->foreignId('used_car_id')->constrained('used_cars')->cascadeOnDelete();
      $table->string('type', 50);
      $table->unsignedTinyInteger('status')->nullable();
      $table->unsignedInteger('cost')->nullable();
      $table->string('comment', 300)->nullable();
      $table->timestamps();

      $table->unique(['used_car_id', 'type']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('used_car_services');
    Schema::dropIfExists('used_cars');
  }
};
