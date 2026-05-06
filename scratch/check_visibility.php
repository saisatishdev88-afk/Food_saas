<?php
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$items = \App\Models\MenuItem::withoutGlobalScopes()->where('tenant_id', 7)->get();
foreach ($items as $item) {
    echo "ID: {$item->id} | Name: {$item->name} | WhatsApp Visible: " . ($item->is_whatsapp_visible ? 'YES' : 'NO') . "\n";
}
