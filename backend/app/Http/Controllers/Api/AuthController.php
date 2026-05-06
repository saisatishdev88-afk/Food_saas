<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Unified login for all roles.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials provided.'
            ], 401);
        }

        // Check if tenant subscription is expired
        if ($user->role !== 'superadmin' && $user->tenant) {
            $expiresAt = $user->tenant->subscription_expires_at;
            if ($expiresAt && \Carbon\Carbon::parse($expiresAt)->isPast()) {
                return response()->json([
                    'message' => 'Your subscription has expired. Please contact support to renew your plan.'
                ], 403);
            }
        }

        // Generate token (generic ability for now)
        $token = $user->createToken('auth-token', ['all-access'])->plainTextToken;

        return response()->json([
            'user' => $user->load('tenant'),
            'token' => $token,
            'role' => $user->role,
        ]);
    }

    /**
     * Handle logout.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
