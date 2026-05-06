<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenant_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('success'); // success, failed, pending
            $table->timestamps();
        });

        // Seed basic settlements for existing tenants
        $tenants = DB::table('tenants')->get();
        foreach ($tenants as $t) {
            $amount = match($t->plan_type) {
                'basic' => 1500,
                'premium' => 3500,
                'pro' => 7500,
                default => 3500,
            };
            DB::table('tenant_settlements')->insert([
                'tenant_id' => $t->id,
                'amount' => $amount,
                'status' => 'success',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_settlements');
    }
};
