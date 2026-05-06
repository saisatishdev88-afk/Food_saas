<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('items');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'type' => 'required|in:offline,online',
            'fulfillment_type' => 'sometimes|in:dine_in,takeaway,delivery',
            'table_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $orderItems = [];
            $tenant = auth()->user()->tenant;
            $prefix = strtoupper(substr($tenant->name, 0, 3));

            foreach ($validated['items'] as $itemData) {
                $menuItem = \App\Models\MenuItem::findOrFail($itemData['menu_item_id']);
                $subtotal = $menuItem->price * $itemData['quantity'];
                $totalAmount += $subtotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'quantity' => $itemData['quantity'],
                    'price' => $menuItem->price,
                    'subtotal' => $subtotal
                ];

                // Deduct inventory if module is enabled
                $modules = $tenant->modules ?? [];
                if (!empty($modules['inventory'])) {
                    foreach ($menuItem->ingredients as $ingredient) {
                        $inventoryItem = \App\Models\InventoryItem::find($ingredient->id);
                        if ($inventoryItem) {
                            $inventoryItem->decrement('stock_level', $ingredient->pivot->quantity * $itemData['quantity']);
                        }
                    }
                }
            }

            $order = Order::create([
                'order_number' => $prefix . '-' . strtoupper(Str::random(6)),
                'tenant_id' => $tenant->id,
                'user_id' => auth()->id(),
                'type' => $validated['type'],
                'fulfillment_type' => $validated['fulfillment_type'] ?? 'takeaway',
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $validated['payment_method'] ?? null,
                'table_number' => $validated['table_number'] ?? null,
                'notes' => $validated['notes'] ?? null
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            return response()->json($order->load('items'), 201);
        });
    }

    public function publicStore(Request $request, $domain)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'table_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'customerName' => 'nullable|string',
        ]);

        $tenant = \App\Models\Tenant::where('domain', $domain)->firstOrFail();

        return DB::transaction(function () use ($validated, $tenant) {
            $totalAmount = 0;
            $orderItems = [];
            $prefix = strtoupper(substr($tenant->name, 0, 3));

            foreach ($validated['items'] as $itemData) {
                // Must ensure menu item belongs to tenant
                $menuItem = \App\Models\MenuItem::withoutGlobalScopes()->where('tenant_id', $tenant->id)->findOrFail($itemData['menu_item_id']);
                $subtotal = $menuItem->price * $itemData['quantity'];
                $totalAmount += $subtotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'quantity' => $itemData['quantity'],
                    'price' => $menuItem->price,
                    'subtotal' => $subtotal
                ];

                // Deduct inventory if module is enabled
                $modules = $tenant->modules ?? [];
                if (!empty($modules['inventory'])) {
                    foreach ($menuItem->ingredients as $ingredient) {
                        $inventoryItem = \App\Models\InventoryItem::withoutGlobalScopes()
                                            ->where('tenant_id', $tenant->id)
                                            ->find($ingredient->id);
                        if ($inventoryItem) {
                            $inventoryItem->decrement('stock_level', $ingredient->pivot->quantity * $itemData['quantity']);
                        }
                    }
                }
            }

            // Temporarily disable global scopes for Order creation since no auth user
            $order = Order::withoutGlobalScopes()->create([
                'order_number' => $prefix . '-' . strtoupper(Str::random(6)),
                'tenant_id' => $tenant->id,
                'user_id' => null, // Guest order
                'type' => 'online',
                'fulfillment_type' => 'dine_in', // default for QR code table orders
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $validated['payment_method'] ?? 'cash',
                'table_number' => $validated['table_number'] ?? null,
                'notes' => $validated['notes'] ?? null
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            return response()->json($order->load('items'), 201);
        });
    }

    public function dashboard()
    {
        \Log::info('Dashboard Request Received');
        $tenantId = auth()->user()->tenant_id;
        $startOfDay = \Carbon\Carbon::today()->startOfDay();
        $endOfDay = \Carbon\Carbon::today()->endOfDay();
        
        $totalOrders = Order::count(); // Global scope handles tenant_id
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        
        $todaysOrders = Order::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
        $todaysRevenue = Order::whereBetween('created_at', [$startOfDay, $endOfDay])
                            ->where('status', '!=', 'cancelled')
                            ->sum('total_amount');
        
        $totalStaff = \App\Models\User::where('tenant_id', $tenantId)->count();
        $totalItems = \App\Models\MenuItem::count();

        $liveOrders = Order::whereIn('status', ['pending', 'accepted', 'preparing', 'ready'])->count();

        $ordersByType = Order::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type')
            ->toArray();

        // Check if inventory module is enabled
        $tenantModules = auth()->user()->tenant->modules ?? [];
        $lowStockItems = [];
        if (!empty($tenantModules['inventory'])) {
            $lowStockItems = \App\Models\InventoryItem::whereColumn('stock_level', '<=', 'alert_threshold')
                                ->orderBy('stock_level')
                                ->get();
        }

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => (float)$totalRevenue,
            'todays_orders' => $todaysOrders,
            'todays_revenue' => (float)$todaysRevenue,
            'total_staff' => $totalStaff,
            'total_items' => $totalItems,
            'live_orders' => $liveOrders,
            'plan_type' => auth()->user()->tenant->plan_type,
            'subscription_expires_at' => auth()->user()->tenant->subscription_expires_at,
            'orders_by_type' => [
                'pos' => $ordersByType['offline'] ?? 0,
                'qr' => $ordersByType['online'] ?? 0,
                'whatsapp' => $ordersByType['whatsapp'] ?? 0,
            ],
            'modules' => auth()->user()->tenant->modules ?? [
                'qr_menu' => false,
                'inventory' => false,
                'shift_management' => false,
                'ai_assistant' => false,
            ],
            'recent_orders' => Order::latest()->take(5)->get(),
            'low_stock_items' => $lowStockItems,
            'ai_insights' => (!empty($tenantModules['ai_assistant'])) ? [
                'best_item' => OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
                                ->where('orders.tenant_id', $tenantId)
                                ->select('item_name', DB::raw('SUM(quantity) as total_qty'))
                                ->groupBy('item_name')
                                ->orderByDesc('total_qty')
                                ->first()?->item_name ?? 'N/A',
                'slow_hours' => '3–5 PM',
                'peak_hours' => '8–10 PM',
                'suggested_action' => 'Add Late Lunch Combo'
            ] : null,
            'ai_forecast' => [
                'peak_hour' => '8:30 PM',
                'trend' => 'High Volume Surge',
                'staff_suggestion' => '+3 additional nodes recommended'
            ]
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,preparing,ready,delivered,cancelled',
            'payment_status' => 'sometimes|in:pending,paid,failed',
            'payment_method' => 'sometimes|string',
            'type' => 'sometimes|in:offline,online'
        ]);

        $order->update($validated);
        return response()->json($order);
    }

    public function show(Order $order)
    {
        return response()->json($order->load('items'));
    }
}
