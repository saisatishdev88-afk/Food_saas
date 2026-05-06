<?php
require __DIR__.'/../backend/vendor/autoload.php';
$app = require_once __DIR__.'/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = 'sk_aYrhlr8hWU-D6uiE5MvNPQ';
$instanceId = 'ins_4GxKXGBS7krm';
$to = '918978305167@s.whatsapp.net';

$endpoints = [
    'https://api.wsapi.chat/message/text',
    'https://api.wsapi.chat/v1/message/text',
    'https://api.wsapi.chat/v1/messages',
    'https://api.wsapi.chat/api/message/text',
    'https://api.wsapi.chat/v1/instances/' . $instanceId . '/messages'
];

foreach ($endpoints as $url) {
    echo "Testing URL: $url\n";
    try {
        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'x-instance-id' => $instanceId,
            'Content-Type' => 'application/json'
        ])->post($url, [
            'to' => $to,
            'text' => 'Direct API Test'
        ]);
        echo "Status: " . $response->status() . "\n";
        echo "Body: " . $response->body() . "\n\n";
    } catch (\Exception $e) {
        echo "Error: " . $e->getMessage() . "\n\n";
    }
}
