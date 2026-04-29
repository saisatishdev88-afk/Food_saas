<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        $items = InventoryItem::orderBy('name')->get();
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'stock_level' => 'required|numeric|min:0',
            'alert_threshold' => 'required|numeric|min:0',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        $item = InventoryItem::create($validated);
        return response()->json($item, 201);
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'stock_level' => 'sometimes|numeric|min:0',
            'alert_threshold' => 'sometimes|numeric|min:0',
        ]);

        $inventoryItem->update($validated);
        return response()->json($inventoryItem);
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();
        return response()->json(['message' => 'Item deleted']);
    }
}
