<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class SuperAdminController extends Controller
{
    /**
     * Authenticate Superadmin and return token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password) || $user->role !== 'superadmin') {
            return response()->json(['message' => 'Invalid Superadmin credentials'], 401);
        }

        $token = $user->createToken('superadmin-token', ['all-access'])->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'role' => $user->role,
        ]);
    }

    /**
     * Platform Dashboard Statistics.
     */
    public function dashboard()
    {
        $mrr = Tenant::all()->sum(function($tenant) {
            switch ($tenant->plan_type) {
                case 'basic': return 1500;
                case 'premium': return 3500;
                case 'pro': return 7500;
                default: return 0;
            }
        });

        return response()->json([
            'total_restaurants' => Tenant::count(),
            'active_restaurants' => Tenant::where('status', 'active')->count(),
            'total_users' => User::count(),
            'global_revenue' => $mrr,
            'system_health' => 'optimal',
            'ai_forecast' => [
                'demand' => [
                    'peak_hour' => '8:30 PM',
                    'trend' => 'Network Scale Optimized',
                    'staff_suggestion' => '+15 resources across nodes'
                ],
                'alerts' => [
                    ['type' => 'expiry', 'message' => 'Chennai Express Node expires in 2 days'],
                    ['type' => 'payment', 'message' => 'Payment failed for Gateway Spice'],
                    ['type' => 'activity', 'message' => 'Low activity detected in Mumbai Hub'],
                ],
                'payment_history' => [
                    ['id' => 1, 'restaurant' => 'Urban Bites', 'amount' => 7500, 'date' => '2024-04-24', 'status' => 'success'],
                    ['id' => 2, 'restaurant' => 'Spice Route', 'amount' => 3500, 'date' => '2024-04-23', 'status' => 'success'],
                    ['id' => 3, 'restaurant' => 'Dosa Hub', 'amount' => 1500, 'date' => '2024-04-20', 'status' => 'failed'],
                ]
            ]
        ]);
    }

    /**
     * List all restaurants/tenants on the platform.
     */
    public function listTenants(Request $request)
    {
        $search = $request->query('search');
        $tenants = Tenant::withCount(['users', 'orders'])
            ->withSum('orders', 'total_amount')
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('domain', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10);
        return response()->json($tenants);
    }

    /**
     * Onboard a new restaurant and its initial admin (owner).
     */
    public function createTenant(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|unique:tenants,domain',
            'email' => 'required|email|unique:tenants,email',
            'plan_type' => 'required|in:basic,premium,pro',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email',
            'owner_password' => 'required|string|min:6',
            'modules' => 'nullable|array',
        ]);

        $tenant = Tenant::create([
            'name' => $validated['name'],
            'domain' => $validated['domain'],
            'email' => $validated['email'],
            'plan_type' => $validated['plan_type'],
            'modules' => $validated['modules'] ?? [
                'qr_menu' => false,
                'inventory' => false,
                'shift_management' => false,
                'ai_assistant' => false,
            ],
        ]);

        $owner = User::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['owner_name'],
            'email' => $validated['owner_email'],
            'password' => Hash::make($validated['owner_password']),
            'role' => 'admin',
        ]);

        return response()->json([
            'message' => 'Restaurant and Owner account initialized successfully',
            'tenant' => $tenant,
            'owner' => $owner
        ], 201);
    }

    /**
     * Get public tenant info for QR menu.
     */
    public function publicTenantInfo($domain)
    {
        $tenant = Tenant::where('domain', $domain)->firstOrFail();
        return response()->json([
            'name' => $tenant->name,
            'logo' => $tenant->logo,
            'banner_url' => $tenant->banner_url ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200',
        ]);
    }
}
