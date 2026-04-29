<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Technician;

class TechnicianLoginController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest:technician')->except('logout');
    }

    public function showLoginForm()
    {
        return view('auth.technician.login');
    }

    public function login(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);

        // Find the technician and check their status
        $technician = Technician::where('email', $request->email)->first();

        if (!$technician) {
            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
            ])->withInput($request->only('email'));
        }

        // Check technician status
        if ($technician->status !== 'approved') {
            $statusMessage = match($technician->status) {
                'pending' => 'Your account is pending approval. Please wait for admin approval.',
                'rejected' => 'Your account has been rejected. Please contact support for more information.',
                default => 'Your account is not active. Please contact support.'
            };

            return back()->withErrors([
                'email' => $statusMessage,
            ])->withInput($request->only('email'));
        }

        // Attempt to log in
        if (Auth::guard('technician')->attempt($request->only('email', 'password'), $request->filled('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('technician.dashboard'));
        }

        return back()->withErrors([
            'email' => 'These credentials do not match our records.',
        ])->withInput($request->only('email'));
    }

    public function logout(Request $request)
    {
        Auth::guard('technician')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('technician.login');
    }
}
