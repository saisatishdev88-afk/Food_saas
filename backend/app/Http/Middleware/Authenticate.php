<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->expectsJson()) {
            return null;
        }

        // Get the current guard from the request
        $guard = $request->segment(1); // This gets the first segment of the URL (admin, customer, or technician)

        // Redirect based on the guard
        switch ($guard) {
            case 'admin':
                return route('admin.login');
            case 'customer':
                return route('customer.login');
            case 'technician':
                return route('technician.login');
            default:
                return route('customer.login'); // Default to customer login
        }
    }
}
