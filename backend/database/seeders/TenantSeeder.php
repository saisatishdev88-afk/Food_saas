<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = [
            ['name' => 'Royal Spice India', 'domain' => 'royalspice', 'plan' => 'pro'],
            ['name' => 'Chennai Express', 'domain' => 'chennai', 'plan' => 'premium'],
            ['name' => 'Mumbai Munchies', 'domain' => 'mumbai', 'plan' => 'basic'],
            ['name' => 'The Goa Grill', 'domain' => 'goagrill', 'plan' => 'premium'],
            ['name' => 'Gateway Spice', 'domain' => 'gateway', 'plan' => 'pro'],
        ];

        foreach ($restaurants as $res) {
            // Check if domain exists to avoid duplicates if rerun
            if (Tenant::where('domain', $res['domain'])->exists()) continue;

            // Create Tenant
            $tenant = Tenant::create([
                'name' => $res['name'],
                'domain' => $res['domain'],
                'email' => "contact@{$res['domain']}.com",
                'plan_type' => $res['plan'],
                'status' => 'active'
            ]);

            // Create Owner
            User::create([
                'tenant_id' => $tenant->id,
                'name' => "{$res['name']} Admin",
                'email' => "admin@{$res['domain']}.com",
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]);

            // Generate some random orders for revenue visualization
            for ($i = 0; $i < rand(10, 25); $i++) {
                Order::create([
                    'tenant_id' => $tenant->id,
                    'user_id' => 1,
                    'order_number' => 'ORD-' . strtoupper(bin2hex(random_bytes(3))),
                    'type' => 'offline',
                    'total_amount' => rand(800, 4500),
                    'status' => 'delivered',
                    'payment_status' => 'paid',
                ]);
            }
        }
    }
}
