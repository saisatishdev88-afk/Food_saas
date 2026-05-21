<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\TenantStaffController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\SubscriptionController;

/*
|--------------------------------------------------------------------------
| API Routes: BistroFlow SaaS
|--------------------------------------------------------------------------
*/

// Unified Auth
Route::post('/admin/login', [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login/clear-sessions', [AuthController::class, 'clearSessions']);

// Public QR Menu & Ordering
Route::get('/public/tenant/{domain}', [\App\Http\Controllers\Api\SuperAdminController::class, 'publicTenantInfo']);
Route::get('/public/menu/{domain}', [\App\Http\Controllers\Api\MenuController::class, 'publicIndex']);
Route::post('/public/orders/{domain}', [\App\Http\Controllers\Api\OrderController::class, 'publicStore']);
Route::post('/public/orders/{domain}/payment-init', [\App\Http\Controllers\Api\RazorpayController::class, 'initiatePayment']);
Route::post('/public/orders/{domain}/payment-verify', [\App\Http\Controllers\Api\RazorpayController::class, 'verifyPayment']);
Route::get('/public/table/{domain}/{tableNumber}/status', [\App\Http\Controllers\Api\TableController::class, 'checkStatus']);

// Social Group Ordering
Route::post('/group-orders/start', [\App\Http\Controllers\Api\GroupOrderController::class, 'startSession']);
Route::get('/group-orders/{token}', [\App\Http\Controllers\Api\GroupOrderController::class, 'getSession']);
Route::post('/group-orders/{token}/items', [\App\Http\Controllers\Api\GroupOrderController::class, 'addItem']);
Route::post('/group-orders/{token}/finalize', [\App\Http\Controllers\Api\GroupOrderController::class, 'finalizeOrder']);

// Public WhatsApp Webhook (Required for WSAPI integration)
Route::post('/whatsapp/webhook', [\App\Http\Controllers\Api\WhatsAppController::class, 'webhook']);

// SuperAdmin Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Platform Management (SuperAdmin)
    Route::prefix('saas')->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/tenants', [SuperAdminController::class, 'listTenants']);
        Route::post('/tenants', [SuperAdminController::class, 'createTenant']);
        Route::put('/tenants/{tenant}', [SuperAdminController::class, 'updateTenant']);

        // Support Tickets
        Route::get('/tickets', [TicketController::class, 'index']);
        Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
        Route::put('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
        Route::post('/tickets/{ticket}/comments', [TicketController::class, 'addComment']);

        // Device Management
        Route::get('/sessions/{userId?}', [SuperAdminController::class, 'getActiveSessions']);
        Route::delete('/sessions/{tokenId}', [SuperAdminController::class, 'logoutSession']);
        Route::delete('/sessions-all', [SuperAdminController::class, 'logoutAllSessions']);
        Route::delete('/force-logout/{userId}', [SuperAdminController::class, 'forceLogoutAll']);
    });

    // Restaurant Management (Owner/Admin/Manager/Staff)
    Route::prefix('tenant')->group(function () {
        Route::get('/staff', [TenantStaffController::class, 'index']);
        Route::post('/staff', [TenantStaffController::class, 'store']);
        Route::delete('/staff/{id}', [TenantStaffController::class, 'destroy']);

        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\OrderController::class, 'dashboard']);
        
        // Menu Management
        Route::get('/menu', [\App\Http\Controllers\Api\MenuController::class, 'index']);
        Route::post('/menu/categories', [\App\Http\Controllers\Api\MenuController::class, 'storeCategory']);
        Route::put('/menu/categories/{category}', [\App\Http\Controllers\Api\MenuController::class, 'updateCategory']);
        Route::delete('/menu/categories/{category}', [\App\Http\Controllers\Api\MenuController::class, 'deleteCategory']);
        
        Route::post('/menu/items', [\App\Http\Controllers\Api\MenuController::class, 'storeItem']);
        Route::put('/menu/items/{menuItem}', [\App\Http\Controllers\Api\MenuController::class, 'updateItem']);
        Route::delete('/menu/items/{menuItem}', [\App\Http\Controllers\Api\MenuController::class, 'deleteItem']);

        // Order Management
        Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'index']);
        Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
        Route::get('/orders/{order}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
        Route::put('/orders/{order}/status', [\App\Http\Controllers\Api\OrderController::class, 'updateStatus']);

        // Inventory Management
        Route::get('/inventory', [\App\Http\Controllers\Api\InventoryController::class, 'index']);
        Route::post('/inventory', [\App\Http\Controllers\Api\InventoryController::class, 'store']);
        Route::put('/inventory/{inventoryItem}', [\App\Http\Controllers\Api\InventoryController::class, 'update']);
        Route::delete('/inventory/{inventoryItem}', [\App\Http\Controllers\Api\InventoryController::class, 'destroy']);

        // Shift Management
        Route::get('/shifts', [\App\Http\Controllers\Api\ShiftController::class, 'index']);
        Route::get('/shifts/status', [\App\Http\Controllers\Api\ShiftController::class, 'status']);
        Route::post('/shifts/toggle', [\App\Http\Controllers\Api\ShiftController::class, 'toggle']);

        // AI Assistant
        Route::post('/ai/chat', [\App\Http\Controllers\Api\AiAssistantController::class, 'chat']);
        Route::post('/ai/report', [\App\Http\Controllers\Api\AiAssistantController::class, 'generateReport']);

        // WhatsApp Ordering
        Route::post('/whatsapp/config', [\App\Http\Controllers\Api\WhatsAppController::class, 'updateConfig']);

        // Razorpay Payment Settings
        Route::get('/razorpay/config', [\App\Http\Controllers\Api\RazorpayController::class, 'getConfig']);
        Route::post('/razorpay/config', [\App\Http\Controllers\Api\RazorpayController::class, 'updateConfig']);

        // POS Payment Routes
        Route::post('/orders/payment-init', [\App\Http\Controllers\Api\RazorpayController::class, 'initiatePayment']);
        Route::post('/orders/payment-verify', [\App\Http\Controllers\Api\RazorpayController::class, 'verifyPayment']);
        Route::post('/orders/{order}/payment-init', [\App\Http\Controllers\Api\RazorpayController::class, 'initiatePOSOrderPayment']);
        Route::post('/orders/{order}/payment-verify', [\App\Http\Controllers\Api\RazorpayController::class, 'verifyPOSOrderPayment']);

        // Support Tickets
        Route::get('/tickets', [TicketController::class, 'index']);
        Route::post('/tickets', [TicketController::class, 'store']);
        Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
        Route::post('/tickets/{ticket}/comments', [TicketController::class, 'addComment']);

        // Subscriptions
        Route::get('/subscription/plans', [SubscriptionController::class, 'getPlans']);
        Route::post('/subscription/renew', [SubscriptionController::class, 'renew']);
        Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade']);

        // Table Management
        Route::get('/tables', [\App\Http\Controllers\Api\TableController::class, 'index']);
        Route::post('/tables', [\App\Http\Controllers\Api\TableController::class, 'store']);
        Route::post('/tables/{id}/release', [\App\Http\Controllers\Api\TableController::class, 'release']);
    });

    // Generic Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Session Management
    Route::get('/sessions', [\App\Http\Controllers\Api\AuthController::class, 'getSessions']);
    Route::delete('/sessions/{tokenId}', [\App\Http\Controllers\Api\AuthController::class, 'revokeSession']);
    Route::delete('/sessions-all', [\App\Http\Controllers\Api\AuthController::class, 'revokeAllSessions']);
    
    // Auth Logout
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
});
