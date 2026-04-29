<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RestaurantDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = \App\Models\Tenant::first();
        if (!$tenant) return;

        // Create Categories
        $burgers = \App\Models\Category::create([
            'tenant_id' => $tenant->id,
            'name' => 'Burgers',
            'slug' => 'burgers',
            'display_order' => 1
        ]);

        $sides = \App\Models\Category::create([
            'tenant_id' => $tenant->id,
            'name' => 'Sides',
            'slug' => 'sides',
            'display_order' => 2
        ]);

        // Create Menu Items
        \App\Models\MenuItem::create([
            'tenant_id' => $tenant->id,
            'category_id' => $burgers->id,
            'name' => 'Classic Cheeseburger',
            'description' => 'Juicy beef patty with cheddar cheese, lettuce, and tomato.',
            'price' => 12.99,
            'is_veg' => false,
            'image_url' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=200&auto=format&fit=crop'
        ]);

        \App\Models\MenuItem::create([
            'tenant_id' => $tenant->id,
            'category_id' => $burgers->id,
            'name' => 'Spicy Zinger',
            'description' => 'Crispy chicken with spicy mayo and jalapenos.',
            'price' => 10.50,
            'is_veg' => false,
            'image_url' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&h=200&auto=format&fit=crop'
        ]);

        \App\Models\MenuItem::create([
            'tenant_id' => $tenant->id,
            'category_id' => $sides->id,
            'name' => 'French Fries',
            'description' => 'Golden crispy fries with sea salt.',
            'price' => 4.50,
            'is_veg' => true,
            'image_url' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=300&h=200&auto=format&fit=crop'
        ]);
    }
}
