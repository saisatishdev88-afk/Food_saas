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

        // 2-Device Limit Check
        if ($user->tokens()->count() >= 2) {
            return response()->json([
                'message' => 'Device limit reached. You are logged in on 2 devices. Please logout from other devices first.',
                'sessions' => $user->tokens->map(function ($token) {
                    return [
                        'id' => $token->id,
                        'device' => $token->name,
                        'ip' => $token->ip_address,
                        'last_active' => $token->last_active_at ? $token->last_active_at->diffForHumans() : 'Unknown'
                    ];
                })
            ], 403);
        }

        // Generate token
        $tokenResult = $user->createToken('auth-token', ['all-access']);
        
        // Save metadata
        $tokenResult->accessToken->update([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_active_at' => now(),
        ]);

        return response()->json([
            'user' => $user->load('tenant'),
            'token' => $tokenResult->plainTextToken,
            'role' => $user->role,
        ]);
    }

    /**
     * Clear all sessions for a user (used for conflict resolution).
     */
    public function clearSessions(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete();

        return response()->json(['message' => 'All sessions cleared successfully']);
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
