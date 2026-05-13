<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('owner_name')->nullable()->after('name');
            $table->string('mobile_number')->nullable()->after('owner_name');
            $table->string('address')->nullable()->after('email');
            $table->string('gst')->nullable()->after('address');
            $table->string('fssai_license')->nullable()->after('gst');
            $table->string('cuisine_type')->nullable()->after('fssai_license');
            $table->string('vendor_status')->default('pending')->after('status');
            $table->string('subscription_status')->default('inactive')->after('vendor_status');
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('plan_id');
            $table->decimal('amount', 10, 2);
            $table->date('start_date');
            $table->date('expiry_date');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('payment_method'); // cash, upi
            $table->decimal('amount', 10, 2);
            $table->string('received_by')->nullable(); // for cash
            $table->string('receipt_number')->nullable(); // for cash
            $table->string('utr_number')->nullable(); // for upi
            $table->string('screenshot_path')->nullable(); // for upi
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending_verification, paid
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
        Schema::dropIfExists('subscriptions');
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['owner_name', 'mobile_number', 'address', 'gst', 'fssai_license', 'cuisine_type', 'vendor_status', 'subscription_status']);
        });
    }
};
