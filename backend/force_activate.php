<?php

use App\Models\Tenant;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Activating ALL tenants...\n";
Tenant::query()->update([
    'status' => 'active',
    'vendor_status' => 'active',
    'subscription_status' => 'active'
]);

echo "Done.\n";
