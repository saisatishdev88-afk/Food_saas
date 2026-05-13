<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GroupOrderController extends Controller
{
    public function startSession(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'host_name' => 'required|string|max:255',
            'table_number' => 'nullable|string',
        ]);

        $sessionToken = Str::random(12);

        $groupOrder = GroupOrder::create([
            'tenant_id' => $validated['tenant_id'],
            'session_token' => $sessionToken,
            'host_name' => $validated['host_name'],
            'table_number' => $validated['table_number'] ?? null,
            'status' => 'open',
        ]);

        \Log::info("Group Order Started: Token={$sessionToken}");
        return response()->json($groupOrder);
    }

    public function getSession($token)
    {
        $groupOrder = GroupOrder::where('session_token', $token)
            ->with(['items.menuItem' => function($q) {
                $q->withoutGlobalScopes();
            }])
            ->firstOrFail();

        return response()->json($groupOrder);
    }

    public function addItem(Request $request, $token)
    {
        $groupOrder = GroupOrder::where('session_token', $token)->firstOrFail();

        if ($groupOrder->status !== 'open') {
            return response()->json(['message' => 'This group order is closed.'], 403);
        }

        $validated = $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1',
            'added_by_name' => 'required|string|max:255',
            'guest_id' => 'nullable|string',
        ]);

        $menuItem = MenuItem::withoutGlobalScopes()->findOrFail($validated['menu_item_id']);

        $item = $groupOrder->items()->create([
            'menu_item_id' => $menuItem->id,
            'item_name' => $menuItem->name,
            'quantity' => $validated['quantity'],
            'price' => $menuItem->price,
            'added_by_name' => $validated['added_by_name'],
            'guest_id' => $validated['guest_id'] ?? null,
        ]);

        // Update total amount
        $groupOrder->increment('total_amount', $menuItem->price * $validated['quantity']);

        return response()->json($item);
    }

    public function removeItem(Request $request, $token, $itemId)
    {
        $groupOrder = GroupOrder::where('session_token', $token)->firstOrFail();

        if ($groupOrder->status !== 'open') {
            return response()->json(['message' => 'This group order is closed.'], 403);
        }

        $item = $groupOrder->items()->findOrFail($itemId);
        
        // Deduction logic
        $groupOrder->decrement('total_amount', $item->price * $item->quantity);
        $item->delete();

        return response()->json(['message' => 'Item removed']);
    }

    public function finalizeOrder(Request $request, $token)
    {
        $groupOrder = GroupOrder::where('session_token', $token)->with('items')->firstOrFail();

        if ($groupOrder->status !== 'open') {
            return response()->json(['message' => 'This group order is already closed.'], 403);
        }

        if ($groupOrder->items->isEmpty()) {
            return response()->json(['message' => 'Cannot finalize an empty order.'], 400);
        }

        $tenant = $groupOrder->tenant;

        return DB::transaction(function () use ($groupOrder, $tenant) {
            $prefix = strtoupper(substr($tenant->name, 0, 3));
            
            $order = Order::withoutGlobalScopes()->create([
                'tenant_id' => $tenant->id,
                'order_number' => $prefix . '-GRP-' . strtoupper(Str::random(6)),
                'total_amount' => $groupOrder->total_amount,
                'status' => 'pending',
                'type' => 'online', // or 'whatsapp' if started from there
                'fulfillment_type' => 'dine_in',
                'payment_status' => 'pending',
                'payment_method' => 'cash',
                'table_number' => $groupOrder->table_number,
                'notes' => "Group Order started by {$groupOrder->host_name}",
            ]);

            foreach ($groupOrder->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item->menu_item_id,
                    'item_name' => "{$item->item_name} (Added by {$item->added_by_name})",
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->price * $item->quantity
                ]);
            }

            $groupOrder->update(['status' => 'closed']);

            return response()->json($order->load('items'));
        });
    }
}
