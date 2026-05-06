<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Tenant;
use App\Models\TenantSettlement;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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

        // 1. Fetch real settlements
        $settlements = TenantSettlement::with('tenant:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'restaurant' => $s->tenant->name ?? 'Unknown',
                    'amount' => (float)$s->amount,
                    'date' => $s->created_at->format('Y-m-d'),
                    'status' => $s->status,
                ];
            });

        // 2. Generate Real Alerts
        $alerts = [];
        $expiringTenants = Tenant::whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '<', now()->addDays(7))
            ->get();
        
        foreach ($expiringTenants as $t) {
            $alerts[] = ['type' => 'expiry', 'message' => "{$t->name} Node expires soon"];
        }

        $failedSettlements = TenantSettlement::with('tenant:id,name')
            ->where('status', 'failed')
            ->latest()
            ->take(2)
            ->get();
        
        foreach ($failedSettlements as $fs) {
            $alerts[] = ['type' => 'payment', 'message' => "Payment failed for {$fs->tenant->name}"];
        }

        if (empty($alerts)) {
            $alerts[] = ['type' => 'activity', 'message' => 'Network status nominal. No active alerts.'];
        }

        // 3. Demand Forecast based on orders
        $totalOrdersToday = \App\Models\Order::whereDate('created_at', Carbon::today())->count();
        $trend = $totalOrdersToday > 50 ? 'High Surge' : 'Network Scale Optimized';

        return response()->json([
            'total_restaurants' => Tenant::count(),
            'active_restaurants' => Tenant::where('status', 'active')->count(),
            'total_users' => User::count(),
            'global_revenue' => $mrr,
            'system_health' => 'optimal',
            'ai_forecast' => [
                'demand' => [
                    'peak_hour' => '8:30 PM',
                    'trend' => $trend,
                    'staff_suggestion' => '+15 resources across nodes'
                ],
                'alerts' => $alerts,
                'payment_history' => $settlements
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
            'subscription_expires_at' => now()->addDays(30),
            'modules' => $validated['modules'] ?? [
                'qr_menu' => false,
                'inventory' => false,
                'shift_management' => false,
                'ai_assistant' => false,
                'whatsapp_ordering' => false,
                'whatsapp_limit' => 500,
            ],
        ]);

        // Create initial settlement
        TenantSettlement::create([
            'tenant_id' => $tenant->id,
            'amount' => match($tenant->plan_type) {
                'basic' => 1500,
                'premium' => 3500,
                'pro' => 7500,
                default => 3500,
            },
            'status' => 'success',
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
