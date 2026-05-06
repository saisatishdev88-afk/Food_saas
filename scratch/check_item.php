<?php
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$item = \App\Models\MenuItem::withoutGlobalScopes()->find(14);
if ($item) {
    echo "Item Found: {$item->name} | Tenant ID: {$item->tenant_id}\n";
} else {
    echo "Item 14 NOT FOUND in any tenant.\n";
}
