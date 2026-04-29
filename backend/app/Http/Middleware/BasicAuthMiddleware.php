<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BasicAuthMiddleware {

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next) {
        $USERNAME = 'apiadmin';
        $PASSWORD = 'apiuser@123';

        if ($request->getUser() !== $USERNAME || $request->getPassword() !== $PASSWORD) {
            return response()->json([
                        'status' => false,
                        'message' => 'Unauthorized',
                            ], 401);
        }

        return $next($request);
    }
}
