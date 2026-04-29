<?php

namespace App\Http\Controllers\Technician\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    use AuthenticatesUsers;

    protected $redirectTo = RouteServiceProvider::TECHNICIAN_HOME;

    public function __construct()
    {
        $this->middleware('guest:technician')->except('logout');
    }

    protected function authenticated(Request $request, $user)
    {
        if ($user->isPending()) {
            auth()->guard('technician')->logout();
            return redirect()->route('technician.login')
                ->with('pending', 'Your account is pending approval. Please wait for admin approval.');
        }

        return redirect()->intended($this->redirectPath());
    }

    public function showLoginForm()
    {
        return view('technician.auth.login');
    }

    protected function guard()
    {
        return auth()->guard('technician');
    }
} 