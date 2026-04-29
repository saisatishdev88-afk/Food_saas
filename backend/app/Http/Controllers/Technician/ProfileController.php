<?php

namespace App\Http\Controllers\Technician;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function edit()
    {
        $technician = Auth::guard('technician')->user();
        return view('technician.profile.edit', compact('technician'));
    }

    public function update(Request $request)
    {
        $technician = Auth::guard('technician')->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('technicians')->ignore($technician->id)],
            'mobile' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string'],
            'specialization' => ['nullable', 'string'],
        ]);

        $technician->update($validated);

        return redirect()->route('technician.profile.edit')
            ->with('success', 'Profile updated successfully.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $technician = Auth::guard('technician')->user();
        $technician->delete();

        Auth::guard('technician')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('technician.login')
            ->with('success', 'Your account has been deleted.');
    }
} 