<?php
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$orders = \App\Models\Order::withoutGlobalScopes()->where('tenant_id', 7)->latest()->take(5)->get();
echo "Found " . $orders->count() . " orders for CAPITAL FOODS.\n";
foreach ($orders as $o) {
    echo "ID: {$o->id} | Num: {$o->order_number} | Type: {$o->type} | Created: {$o->created_at}\n";
}
