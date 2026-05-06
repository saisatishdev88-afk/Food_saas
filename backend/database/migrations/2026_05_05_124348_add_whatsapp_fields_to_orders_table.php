<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_phone')->nullable()->after('user_id');
        });

        // Update enum for type
        // Note: For SQLite/MySQL we might need different approaches, but standard SQL for enum change:
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN type ENUM('offline', 'online', 'whatsapp') DEFAULT 'offline'");
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('customer_phone');
        });
        
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN type ENUM('offline', 'online') DEFAULT 'offline'");
        }
    }
};
