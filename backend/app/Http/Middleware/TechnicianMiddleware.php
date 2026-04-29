<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TechnicianMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('technician')->check()) {
            return redirect()->route('technician.login');
        }

        $technician = Auth::guard('technician')->user();
        
        if ($technician->status !== 'approved') {
            Auth::guard('technician')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            $statusMessage = match($technician->status) {
                'pending' => 'Your account is pending approval. Please wait for admin approval.',
                'rejected' => 'Your account has been rejected. Please contact support for more information.',
                default => 'Your account is not active. Please contact support.'
            };
            
            return redirect()->route('technician.login')
                ->with('error', $statusMessage);
        }

        return $next($request);
    }
}
