<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Root Superadmin',
            'email' => 'root@bistroflow.io',
            'password' => bcrypt('admin123'),
            'role' => 'superadmin',
            'tenant_id' => null,
        ]);
    }
}
