<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Technician;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class TechnicianRegisterController extends Controller {

    public function __construct() {
        $this->middleware('guest:technician');
    }

    public function showRegistrationForm() {
        $services = Service::where('status', true)->get();
        return view('auth.technician.register', compact('services'));
    }

    public function register(Request $request) {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:technicians',
            'mobile' => 'required|string|max:20',
//            'city' => 'required|string|max:100',
            'address' => 'required|string',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'services' => 'required|array|min:1',
            'services.*' => 'exists:services,id',
            'password' => 'required|string|min:8|confirmed',
            'terms' => 'required'
        ]);

        // Handle file upload
        $documentPath = $request->file('document')->store('technician-documents', 'public');

        $technician = Technician::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'mobile' => $request->mobile,
//            'city' => $request->city,
                    'address' => $request->address,
                    'document' => $documentPath,
                    'password' => Hash::make($request->password),
                    'status' => 'pending'
        ]);

        // Attach selected services
        $technician->services()->attach($request->services);

        // Log the technician in
        Auth::guard('technician')->login($technician);

        return redirect()->route('technician.dashboard')
                        ->with('success', 'Registration successful! Your account is pending approval.');
    }
}
