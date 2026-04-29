<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $key) {
            $key->id();
            $key->string('name');
            $key->string('domain')->unique(); // For identification (no subdomains, so just a unique slug/name)
            $key->string('logo')->nullable();
            $key->string('email')->unique();
            $key->string('phone')->nullable();
            $key->enum('status', ['active', 'suspended', 'pending'])->default('active');
            $key->string('plan_type')->default('basic'); // basic, premium, pro
            $key->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
