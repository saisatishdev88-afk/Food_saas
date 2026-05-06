<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\TenantStaffController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes: BistroFlow SaaS
|--------------------------------------------------------------------------
*/

// Unified Auth
Route::post('/admin/login', [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'login']);

// Public QR Menu & Ordering
Route::get('/public/tenant/{domain}', [\App\Http\Controllers\Api\SuperAdminController::class, 'publicTenantInfo']);
Route::get('/public/menu/{domain}', [\App\Http\Controllers\Api\MenuController::class, 'publicIndex']);
Route::post('/public/orders/{domain}', [\App\Http\Controllers\Api\OrderController::class, 'publicStore']);

// Public WhatsApp Webhook (Required for WSAPI integration)
Route::post('/whatsapp/webhook', [\App\Http\Controllers\Api\WhatsAppController::class, 'webhook']);

// SuperAdmin Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Platform Management (SuperAdmin)
    Route::prefix('saas')->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/tenants', [SuperAdminController::class, 'listTenants']);
        Route::post('/tenants', [SuperAdminController::class, 'createTenant']);
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
    });

    // Generic Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
