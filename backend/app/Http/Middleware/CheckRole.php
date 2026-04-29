<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, $role)
    {
        if (!$request->user() || !$request->user()->role) {
            return redirect('login');
        }

        $roleSlug = $request->user()->role->slug;
        
        if ($role === 'admin' && $roleSlug !== 'admin') {
            return redirect()->route('customer.dashboard');
        }
        
        if ($role === 'technician' && $roleSlug !== 'technician') {
            return redirect()->route('customer.dashboard');
        }
        
        if ($role === 'customer' && $roleSlug !== 'customer') {
            return redirect()->route('customer.dashboard');
        }

        return $next($request);
    }
} 