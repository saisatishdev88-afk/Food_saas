<?php
use App\Models\User;
use App\Models\Shift;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\ShiftController;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::where('role', 'waiter')->first();
if (!$user) {
    die("No waiter found\n");
}

Auth::login($user);
echo "Testing shift toggle for user: {$user->name} (ID: {$user->id})\n";

try {
    $controller = new ShiftController();
    $response = $controller->toggle();
    print_r($response->getData());
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
