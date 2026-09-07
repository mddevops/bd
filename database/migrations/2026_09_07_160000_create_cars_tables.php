<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('car_statuses', function (Blueprint $table) {
      $table->id();
      $table->unsignedInteger('ordering')->nullable();
      $table->string('name', 100);
      $table->string('color', 100)->nullable();
      $table->string('text_color', 100)->nullable();
      $table->timestamps();
    });

    Schema::create('cars', function (Blueprint $table) {
      $table->id();

      $table->foreignId('showroom_id')->nullable()->constrained('showrooms')->nullOnDelete();
      $table->string('link', 255)->nullable();
      $table->date('arrival_date')->nullable();
      $table->foreignId('mark_id')->constrained('auto_marks')->restrictOnDelete();
      $table->foreignId('model_id')->constrained('auto_models')->restrictOnDelete();
      $table->unsignedSmallInteger('year')->default(0);
      $table->string('complectation', 100)->nullable();

      $table->foreignId('body_type_id')->nullable()->constrained('body_types')->nullOnDelete();
      $table->foreignId('transmission_id')->nullable()->constrained('transmissions')->nullOnDelete();
      $table->foreignId('engine_type_id')->nullable()->constrained('engine_types')->nullOnDelete();
      $table->foreignId('wheel_type_id')->nullable()->constrained('wheel_types')->nullOnDelete();
      $table->unsignedInteger('power')->nullable();
      $table->string('salon', 100)->nullable();
      $table->string('color', 100)->nullable();
      $table->string('engine_volume', 50)->nullable();
      $table->string('vin', 100)->nullable()->index();
      $table->string('body_number', 100)->nullable();
      $table->unsignedTinyInteger('pts_type')->nullable()->default(1)->comment('0 — нет, 1 — ПТС, 2 — ЭПТС');

      $table->unsignedInteger('price')->nullable();
      $table->unsignedInteger('transport_cost')->nullable();
      $table->unsignedInteger('sale_price')->nullable();
      $table->boolean('sell_out')->nullable();
      $table->string('supplier', 150)->nullable();
      $table->unsignedInteger('avito_price')->nullable();
      $table->string('key_number', 100)->nullable();

      $table->foreignId('status_id')->nullable()->constrained('car_statuses')->nullOnDelete();
      $table->boolean('is_sold')->nullable();
      $table->unsignedTinyInteger('transit')->default(0)->comment('1 — выезд, 2 — въезд');
      $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
      $table->text('comment')->nullable();
      $table->unsignedInteger('direct')->nullable();
      $table->boolean('service_book')->nullable();

      $table->softDeletes();
      $table->timestamps();

      $table->index('showroom_id');
      $table->index('mark_id');
      $table->index(['status_id', 'showroom_id']);
      $table->index(['mark_id', 'model_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('cars');
    Schema::dropIfExists('car_statuses');
  }
};
