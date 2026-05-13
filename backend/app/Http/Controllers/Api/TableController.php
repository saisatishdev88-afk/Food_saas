<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantTable;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    /**
     * Public check: See if a table is occupied before showing menu.
     */
    public function checkStatus(Request $request, $domain, $tableNumber)
    {
        $tenant = Tenant::where('domain', $domain)->firstOrFail();
        
        $table = RestaurantTable::firstOrCreate(
            ['tenant_id' => $tenant->id, 'table_number' => $tableNumber],
            ['status' => 'available']
        );

        return response()->json([
            'table_number' => $table->table_number,
            'status' => $table->status,
            'is_occupied' => $table->isOccupied(),
            'message' => $table->isOccupied() ? 'This table is currently occupied. Please wait or contact a waiter.' : 'Table is available.'
        ]);
    }

    /**
     * Private: List all tables for a tenant.
     */
    public function index(Request $request)
    {
        $tables = RestaurantTable::where('tenant_id', auth()->user()->tenant_id)->get();
        return response()->json($tables);
    }

    /**
     * Private: Release/Unlock a table.
     */
    public function release(Request $request, $id)
    {
        $table = RestaurantTable::where('tenant_id', auth()->user()->tenant_id)->findOrFail($id);
        $table->release();

        return response()->json([
            'message' => "Table {$table->table_number} is now available.",
            'table' => $table
        ]);
    }

    /**
     * Private: Add/Update tables.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required|string',
        ]);

        $table = RestaurantTable::updateOrCreate(
            ['tenant_id' => auth()->user()->tenant_id, 'table_number' => $validated['table_number']],
            ['status' => 'available']
        );

        return response()->json($table);
    }
}
