<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$namesToDelete = [
    'Royal Spice India',
    'Mumbai Munchies',
    'Gateway Spice',
    'The Goa Grill'
];

echo "Starting cleanup...\n";

foreach ($namesToDelete as $name) {
    $tenant = Tenant::where('name', $name)->first();
    if ($tenant) {
        echo "Deleting tenant: {$name} (ID: {$tenant->id})\n";
        
        // Delete related records
        DB::table('subscription_payments')->where('tenant_id', $tenant->id)->delete();
        DB::table('subscriptions')->where('tenant_id', $tenant->id)->delete();
        DB::table('users')->where('tenant_id', $tenant->id)->delete();
        // Add more tables if needed (orders, etc.)
        DB::table('orders')->where('tenant_id', $tenant->id)->delete();
        
        $tenant->delete();
    } else {
        echo "Tenant not found: {$name}\n";
    }
}

echo "Activating remaining subscriptions...\n";
Tenant::where('status', '!=', 'active')
    ->update([
        'status' => 'active',
        'vendor_status' => 'active',
        'subscription_status' => 'active'
    ]);

echo "Done.\n";
