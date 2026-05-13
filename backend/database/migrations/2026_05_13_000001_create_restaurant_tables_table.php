<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('table_number');
            $table->enum('status', ['available', 'occupied'])->default('available');
            $table->string('session_token')->nullable();
            $table->foreignId('last_order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->timestamps();

            $table->unique(['tenant_id', 'table_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_tables');
    }
};
