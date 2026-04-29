<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class CustomerRegisterController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest:customer');
    }

    public function showRegistrationForm()
    {
        return view('auth.customer.register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers',
            'password' => 'required|string|min:8|confirmed',
            'mobile' => 'required|string|max:20',
            'address' => 'required|string',
            'terms' => 'required'
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'mobile' => $validated['mobile'],
            'address' => $validated['address'],
        ]);

        Auth::guard('customer')->login($customer);

        return redirect()->route('customer.dashboard');
    }
}
