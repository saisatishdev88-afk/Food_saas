<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class TenantStaffController extends Controller
{
    /**
     * List all staff members for the current tenant.
     */
    public function index()
    {
        $tenantId = Auth::user()->tenant_id;
        
        // Return all users for this tenant EXCEPT the owner themselves (optional)
        $staff = User::where('tenant_id', $tenantId)
                    ->where('role', '!=', 'superadmin')
                    ->latest()
                    ->get();
                    
        return response()->json($staff);
    }

    /**
     * Create a new staff member.
     */
    public function store(Request $request)
    {
        $tenantId = Auth::user()->tenant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:manager,chef,waiter,delivery',
        ]);

        $staff = User::create([
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'Staff member created successfully',
            'staff' => $staff
        ], 201);
    }

    /**
     * Delete a staff member.
     */
    public function destroy($id)
    {
        $tenantId = Auth::user()->tenant_id;
        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);
        
        if ($staff->id === Auth::id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $staff->delete();
        return response()->json(['message' => 'Staff member removed successfully']);
    }
}
