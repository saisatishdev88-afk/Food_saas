<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        // Admin overview should see everything; Public menu filters active
        $isAdmin = $request->has('admin');

        $query = Category::with(['menuItems' => function($query) use ($isAdmin) {
            $query->with('ingredients');
            if (!$isAdmin) {
                $query->where('is_available', true);
            }
        }]);

        if (!$isAdmin) {
            $query->where('is_active', true);
        }

        $menu = $query->orderBy('display_order')->get();
        return response()->json($menu);
    }

    public function publicIndex(Request $request, $domain)
    {
        $tenant = \App\Models\Tenant::where('domain', $domain)->firstOrFail();
        
        // Disable scope temporarily or query via relationship if models use global scope
        $query = Category::withoutGlobalScopes()->where('tenant_id', $tenant->id)->where('is_active', true)
            ->with(['menuItems' => function($q) use ($tenant) {
                $q->withoutGlobalScopes()->where('tenant_id', $tenant->id)->where('is_available', true);
            }]);

        return response()->json($query->orderBy('display_order')->get());
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'display_order' => 'nullable|integer',
            'image_url' => 'nullable|string'
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['tenant_id'] = auth()->user()->tenant_id;

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'display_order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean'
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        return response()->json($category);
    }

    public function deleteCategory(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string',
            'is_veg' => 'required|boolean',
            'prep_time' => 'nullable|integer',
            'is_whatsapp_visible' => 'sometimes|boolean',
            'ingredients' => 'sometimes|array',
            'ingredients.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'ingredients.*.quantity' => 'required|numeric|min:0'
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        $item = MenuItem::create(collect($validated)->except('ingredients')->toArray());

        if (isset($validated['ingredients'])) {
            $syncData = [];
            foreach ($validated['ingredients'] as $ing) {
                $syncData[$ing['inventory_item_id']] = ['quantity' => $ing['quantity']];
            }
            $item->ingredients()->sync($syncData);
        }

        return response()->json($item->load('ingredients'), 201);
    }

    public function updateItem(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|string',
            'is_available' => 'sometimes|boolean',
            'is_veg' => 'sometimes|boolean',
            'is_whatsapp_visible' => 'sometimes|boolean',
            'ingredients' => 'sometimes|array',
            'ingredients.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'ingredients.*.quantity' => 'required|numeric|min:0'
        ]);

        $menuItem->update(collect($validated)->except('ingredients')->toArray());

        if (isset($validated['ingredients'])) {
            $syncData = [];
            foreach ($validated['ingredients'] as $ing) {
                $syncData[$ing['inventory_item_id']] = ['quantity' => $ing['quantity']];
            }
            $menuItem->ingredients()->sync($syncData);
        }

        return response()->json($menuItem->load('ingredients'));
    }

    public function deleteItem(MenuItem $menuItem)
    {
        $menuItem->delete();
        return response()->json(['message' => 'Menu item deleted']);
    }
}
