<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tenants = \App\Models\Tenant::all();
foreach ($tenants as $t) {
    echo "ID: {$t->id} | Name: {$t->name} | Instance ID: " . ($t->whatsapp_config['instance_id'] ?? 'NONE') . "\n";
}
