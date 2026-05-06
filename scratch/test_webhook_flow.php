<?php
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

$payload = [
    "eventType" => "message",
    "instanceId" => "ins_4GxKXGBS7krm",
    "eventData" => [
        "sender" => ["phone" => "918978305167"],
        "text" => "hi"
    ]
];

$response = Http::post("http://localhost:8000/api/whatsapp/webhook", $payload);

echo "Status: " . $response->status() . "\n";
echo "Body: " . $response->body() . "\n";
