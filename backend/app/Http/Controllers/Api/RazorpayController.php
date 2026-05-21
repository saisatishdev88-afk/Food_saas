<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\TempOrder;
use App\Models\TempOrderItem;
use App\Models\Tenant;
use App\Models\MenuItem;
use App\Models\RestaurantTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class RazorpayController extends Controller
{
    /**
     * Initiate payment for online QR menu ordering or POS
     */
    public function initiatePayment(Request $request, $domain = null)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'table_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'customer_phone' => 'nullable|string',
            'fulfillment_type' => 'sometimes|in:dine_in,takeaway,delivery',
            'type' => 'sometimes|in:offline,online,whatsapp'
        ]);

        // Resolve Tenant
        if ($domain) {
            $tenant = Tenant::where('domain', $domain)->firstOrFail();
        } else {
            // POS request is authenticated
            $tenant = auth()->user()->tenant;
        }

        // Razorpay Credentials
        $config = $tenant->razorpay_config ?? [];
        $keyId = $config['key_id'] ?? env('RAZORPAY_KEY_ID', 'rzp_test_XN2L2K23wq19XJ');
        $keySecret = $config['key_secret'] ?? env('RAZORPAY_KEY_SECRET', 'rzp_test_secret_key_123');

        if (empty($keyId) || empty($keySecret)) {
            return response()->json(['message' => 'Razorpay payment gateway is not configured for this restaurant.'], 400);
        }

        return DB::transaction(function () use ($validated, $tenant, $keyId, $keySecret) {
            $totalAmount = 0;
            $tempOrderItems = [];
            $prefix = strtoupper(substr($tenant->name, 0, 3));

            foreach ($validated['items'] as $itemData) {
                // Fetch menu item depending on global scopes
                $query = MenuItem::where('tenant_id', $tenant->id);
                if (!auth()->check()) {
                    $query->withoutGlobalScopes();
                }
                $menuItem = $query->findOrFail($itemData['menu_item_id']);
                
                $subtotal = $menuItem->price * $itemData['quantity'];
                $totalAmount += $subtotal;

                $tempOrderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'quantity' => $itemData['quantity'],
                    'price' => $menuItem->price,
                    'subtotal' => $subtotal
                ];
            }

            // Optional Table status checks (QR orders)
            if (!empty($validated['table_number'])) {
                $table = RestaurantTable::where('tenant_id', $tenant->id)
                    ->where('table_number', $validated['table_number'])
                    ->first();
                
                if ($table && $table->isOccupied()) {
                    return response()->json(['message' => 'This table is already occupied. Please contact a waiter.'], 403);
                }
            }

            // Create Temporary Order
            $tempOrder = TempOrder::withoutGlobalScopes()->create([
                'tenant_id' => $tenant->id,
                'user_id' => auth()->id(), // null for public guest
                'customer_phone' => $validated['customer_phone'] ?? null,
                'customer_name' => $validated['customer_name'] ?? 'Guest Customer',
                'order_number' => $prefix . '-' . strtoupper(Str::random(6)),
                'type' => $validated['type'] ?? (auth()->check() ? 'offline' : 'online'),
                'fulfillment_type' => $validated['fulfillment_type'] ?? 'dine_in',
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => 'razorpay',
                'payment_type' => 'online',
                'table_number' => $validated['table_number'] ?? null,
                'notes' => $validated['notes'] ?? null
            ]);

            foreach ($tempOrderItems as $item) {
                $tempOrder->items()->create($item);
            }

            // Create Order on Razorpay
            $amountInPaise = round($totalAmount * 100);
            
            try {
                $response = Http::withBasicAuth($keyId, $keySecret)
                    ->post('https://api.razorpay.com/v1/orders', [
                        'amount' => $amountInPaise,
                        'currency' => 'INR',
                        'receipt' => 'temp_' . $tempOrder->id
                    ]);

                if (!$response->successful()) {
                    \Log::error('Razorpay Order Creation Failed: ' . $response->body());
                    return response()->json(['message' => 'Failed to initialize payment order with Razorpay: ' . ($response->json('error.description') ?? 'Unknown error')], 500);
                }

                $rzpOrder = $response->json();
                $tempOrder->update(['razorpay_order_id' => $rzpOrder['id']]);

                return response()->json([
                    'temp_order_id' => $tempOrder->id,
                    'razorpay_order_id' => $rzpOrder['id'],
                    'amount' => $amountInPaise,
                    'currency' => 'INR',
                    'key_id' => $keyId,
                    'restaurant_name' => $tenant->name
                ]);

            } catch (\Exception $e) {
                \Log::error('Razorpay Exception: ' . $e->getMessage());
                return response()->json(['message' => 'Payment server connection error: ' . $e->getMessage()], 500);
            }
        });
    }

    /**
     * Verify payment signature and promote temp order to main order
     */
    public function verifyPayment(Request $request, $domain = null)
    {
        $validated = $request->validate([
            'temp_order_id' => 'required|integer',
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_signature' => 'required|string'
        ]);

        $tempOrder = TempOrder::withoutGlobalScopes()
            ->with('items')
            ->findOrFail($validated['temp_order_id']);

        $tenant = Tenant::findOrFail($tempOrder->tenant_id);

        // Get Secret Key
        $config = $tenant->razorpay_config ?? [];
        $keyId = $config['key_id'] ?? env('RAZORPAY_KEY_ID', 'rzp_test_XN2L2K23wq19XJ');
        $keySecret = $config['key_secret'] ?? env('RAZORPAY_KEY_SECRET', 'rzp_test_secret_key_123');

        // Verify Signature
        $generatedSignature = hash_hmac(
            'sha256', 
            $validated['razorpay_order_id'] . '|' . $validated['razorpay_payment_id'], 
            $keySecret
        );

        if (!hash_equals($generatedSignature, $validated['razorpay_signature'])) {
            $tempOrder->update(['payment_status' => 'failed']);
            return response()->json(['message' => 'Payment signature verification failed.'], 400);
        }

        // Signature Verified! Transition Order to Main tables
        return DB::transaction(function () use ($tempOrder, $tenant, $validated) {
            
            $paymentResponse = [
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_order_id' => $validated['razorpay_order_id'],
                'razorpay_signature' => $validated['razorpay_signature'],
                'verified_at' => now()->toIso8601String()
            ];

            // Create Main Order
            $order = Order::withoutGlobalScopes()->create([
                'tenant_id' => $tempOrder->tenant_id,
                'user_id' => $tempOrder->user_id,
                'customer_phone' => $tempOrder->customer_phone,
                'order_number' => $tempOrder->order_number,
                'type' => $tempOrder->type,
                'total_amount' => $tempOrder->total_amount,
                'tax_amount' => $tempOrder->tax_amount,
                'service_charge' => $tempOrder->service_charge,
                'status' => 'accepted', // Auto accepted on paid
                'payment_status' => 'paid',
                'payment_method' => 'razorpay',
                'payment_type' => 'online',
                'fulfillment_type' => $tempOrder->fulfillment_type,
                'table_number' => $tempOrder->table_number,
                'notes' => $tempOrder->notes,
                'payment_response' => $paymentResponse
            ]);

            // Create Order Items and Deduct Inventory
            $modules = $tenant->modules ?? [];
            $inventoryEnabled = !empty($modules['inventory']);

            foreach ($tempOrder->items as $tempItem) {
                $order->items()->create([
                    'menu_item_id' => $tempItem->menu_item_id,
                    'item_name' => $tempItem->item_name,
                    'quantity' => $tempItem->quantity,
                    'price' => $tempItem->price,
                    'subtotal' => $tempItem->subtotal
                ]);

                // Deduct stock if enabled
                if ($inventoryEnabled) {
                    $menuItem = MenuItem::withoutGlobalScopes()->find($tempItem->menu_item_id);
                    if ($menuItem) {
                        foreach ($menuItem->ingredients as $ingredient) {
                            $inventoryItem = \App\Models\InventoryItem::withoutGlobalScopes()
                                ->where('tenant_id', $tenant->id)
                                ->find($ingredient->id);
                            if ($inventoryItem) {
                                $inventoryItem->decrement(
                                    'stock_level', 
                                    $ingredient->pivot->quantity * $tempItem->quantity
                                );
                            }
                        }
                    }
                }
            }

            // Handle Table locking if applicable
            if ($tempOrder->table_number) {
                $table = RestaurantTable::withoutGlobalScopes()
                    ->where('tenant_id', $tenant->id)
                    ->where('table_number', $tempOrder->table_number)
                    ->first();

                if ($table) {
                    $table->lock(Str::random(32), $order->id);
                }
            }

            // Delete Temporary Order & Items
            $tempOrder->items()->delete();
            $tempOrder->delete();

            return response()->json([
                'message' => 'Payment verified & order created successfully.',
                'order' => $order->load('items')
            ]);
        });
    }

    /**
     * Initiate payment for an existing order (POS flow)
     */
    public function initiatePOSOrderPayment(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);
        $tenant = auth()->user()->tenant;

        $config = $tenant->razorpay_config ?? [];
        $keyId = $config['key_id'] ?? env('RAZORPAY_KEY_ID', 'rzp_test_XN2L2K23wq19XJ');
        $keySecret = $config['key_secret'] ?? env('RAZORPAY_KEY_SECRET', 'rzp_test_secret_key_123');

        if (empty($keyId) || empty($keySecret)) {
            return response()->json(['message' => 'Razorpay payment gateway is not configured for this restaurant.'], 400);
        }

        $amountInPaise = round($order->total_amount * 100);

        try {
            $response = Http::withBasicAuth($keyId, $keySecret)
                ->post('https://api.razorpay.com/v1/orders', [
                    'amount' => $amountInPaise,
                    'currency' => 'INR',
                    'receipt' => 'order_' . $order->id
                ]);

            if (!$response->successful()) {
                return response()->json(['message' => 'Failed to initialize payment with Razorpay: ' . ($response->json('error.description') ?? 'Unknown error')], 500);
            }

            $rzpOrder = $response->json();
            
            // Save the razorpay order id on the order
            $order->update(['payment_response' => array_merge($order->payment_response ?? [], ['razorpay_order_id' => $rzpOrder['id']])]);

            return response()->json([
                'order_id' => $order->id,
                'razorpay_order_id' => $rzpOrder['id'],
                'amount' => $amountInPaise,
                'currency' => 'INR',
                'key_id' => $keyId,
                'restaurant_name' => $tenant->name
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Payment server connection error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verify payment for an existing order (POS flow)
     */
    public function verifyPOSOrderPayment(Request $request, $orderId)
    {
        $validated = $request->validate([
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_signature' => 'required|string'
        ]);

        $order = Order::findOrFail($orderId);
        $tenant = auth()->user()->tenant;

        $config = $tenant->razorpay_config ?? [];
        $keyId = $config['key_id'] ?? env('RAZORPAY_KEY_ID', 'rzp_test_XN2L2K23wq19XJ');
        $keySecret = $config['key_secret'] ?? env('RAZORPAY_KEY_SECRET', 'rzp_test_secret_key_123');

        // Verify Signature
        $generatedSignature = hash_hmac(
            'sha256', 
            $validated['razorpay_order_id'] . '|' . $validated['razorpay_payment_id'], 
            $keySecret
        );

        if (!hash_equals($generatedSignature, $validated['razorpay_signature'])) {
            $order->update(['payment_status' => 'failed']);
            return response()->json(['message' => 'Payment signature verification failed.'], 400);
        }

        $paymentResponse = [
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
            'razorpay_order_id' => $validated['razorpay_order_id'],
            'razorpay_signature' => $validated['razorpay_signature'],
            'verified_at' => now()->toIso8601String()
        ];

        $order->update([
            'status' => 'accepted',
            'payment_status' => 'paid',
            'payment_method' => 'razorpay',
            'payment_type' => 'online',
            'payment_response' => $paymentResponse
        ]);

        return response()->json([
            'message' => 'Payment verified successfully.',
            'order' => $order->load('items')
        ]);
    }

    /**
     * Get active config (Owner view)
     */
    public function getConfig(Request $request)
    {
        $tenant = auth()->user()->tenant;
        $config = $tenant->razorpay_config ?? [];

        return response()->json([
            'key_id' => $config['key_id'] ?? '',
            'enabled' => (bool)($config['enabled'] ?? false),
            'has_secret' => !empty($config['key_secret'])
        ]);
    }

    /**
     * Update active config (Owner operation)
     */
    public function updateConfig(Request $request)
    {
        $validated = $request->validate([
            'key_id' => 'required|string',
            'key_secret' => 'nullable|string',
            'enabled' => 'required|boolean'
        ]);

        $tenant = auth()->user()->tenant;
        $currentConfig = $tenant->razorpay_config ?? [];

        $newConfig = [
            'key_id' => $validated['key_id'],
            'key_secret' => $validated['key_secret'] ?? ($currentConfig['key_secret'] ?? ''),
            'enabled' => $validated['enabled']
        ];

        $tenant->update(['razorpay_config' => $newConfig]);

        return response()->json([
            'message' => 'Razorpay configuration updated successfully.',
            'config' => [
                'key_id' => $newConfig['key_id'],
                'enabled' => $newConfig['enabled'],
                'has_secret' => !empty($newConfig['key_secret'])
            ]
        ]);
    }
}
