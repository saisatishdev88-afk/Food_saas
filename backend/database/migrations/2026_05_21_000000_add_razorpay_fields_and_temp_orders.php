<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add razorpay fields to tenants
        Schema::table('tenants', function (Blueprint $table) {
            $table->json('razorpay_config')->nullable()->after('whatsapp_config');
        });

        // 2. Add payment columns to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_type')->nullable()->after('payment_method'); // cash, online
            $table->json('payment_response')->nullable()->after('notes');
        });

        // 3. Create temp_orders table
        Schema::create('temp_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('customer_phone')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('order_number');
            $table->enum('type', ['offline', 'online', 'whatsapp'])->default('offline');
            $table->enum('fulfillment_type', ['dine_in', 'takeaway', 'delivery'])->default('takeaway');
            $table->decimal('total_amount', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('service_charge', 12, 2)->default(0);
            $table->enum('status', ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_type')->nullable();
            $table->string('table_number')->nullable();
            $table->text('notes')->nullable();
            $table->string('razorpay_order_id')->nullable();
            $table->json('payment_response')->nullable();
            $table->timestamps();
        });

        // 4. Create temp_order_items table
        Schema::create('temp_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('temp_order_id')->constrained('temp_orders')->onDelete('cascade');
            $table->foreignId('menu_item_id')->constrained()->onDelete('cascade');
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('price', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temp_order_items');
        Schema::dropIfExists('temp_orders');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_type', 'payment_response']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('razorpay_config');
        });
    }
};
