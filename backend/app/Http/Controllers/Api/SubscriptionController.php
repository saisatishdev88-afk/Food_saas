<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\TenantSettlement;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function getPlans()
    {
        return response()->json([
            'current_plan' => Auth::user()->tenant->plan_type,
            'expires_at' => Auth::user()->tenant->subscription_expires_at,
            'is_expired' => Auth::user()->tenant->isSubscriptionExpired(),
            'plans' => [
                ['id' => 'basic', 'name' => 'Standard Tier', 'price' => 1500, 'features' => ['Core POS', 'Table Management']],
                ['id' => 'premium', 'name' => 'Growth Tier', 'price' => 3500, 'features' => ['Core POS', 'Inventory', 'QR Menu', 'Shifts']],
                ['id' => 'pro', 'name' => 'Enterprise Tier', 'price' => 7500, 'features' => ['All Features', 'AI Assistant', 'WhatsApp Ordering']],
            ]
        ]);
    }

    public function renew(Request $request)
    {
        $tenant = Auth::user()->tenant;
        
        // In a real app, integrate payment here. 
        // For now, we simulate success.

        $price = match($tenant->plan_type) {
            'basic' => 1500,
            'premium' => 3500,
            'pro' => 7500,
            default => 3500,
        };

        // Update expiry
        $currentExpiry = $tenant->subscription_expires_at && $tenant->subscription_expires_at->isFuture() 
            ? $tenant->subscription_expires_at 
            : now();
            
        $tenant->update([
            'subscription_expires_at' => $currentExpiry->addDays(30),
            'is_first_subscription' => false,
        ]);

        TenantSettlement::create([
            'tenant_id' => $tenant->id,
            'amount' => $price,
            'status' => 'success',
        ]);

        return response()->json([
            'message' => 'Subscription renewed successfully',
            'tenant' => $tenant
        ]);
    }

    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_type' => 'required|in:premium,pro',
        ]);

        $tenant = Auth::user()->tenant;
        
        $price = match($request->plan_type) {
            'premium' => 3500,
            'pro' => 7500,
            default => 3500,
        };

        $tenant->update([
            'plan_type' => $request->plan_type,
            'subscription_expires_at' => now()->addDays(30), // Reset to 30 days from now on upgrade
            'is_first_subscription' => false,
        ]);

        TenantSettlement::create([
            'tenant_id' => $tenant->id,
            'amount' => $price,
            'status' => 'success',
        ]);

        return response()->json([
            'message' => 'Plan upgraded successfully',
            'tenant' => $tenant
        ]);
    }
}
