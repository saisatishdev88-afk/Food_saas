<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminProfileController extends Controller
{
    public function show()
    {
        return view('admin.profile.show', [
            'admin' => auth()->guard('admin')->user()
        ]);
    }

    public function update(Request $request)
    {
        $admin = auth()->guard('admin')->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('admins')->ignore($admin->id)],
            'current_password' => ['required_with:new_password', 'current_password:admin'],
            'new_password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $admin->name = $validated['name'];
        $admin->email = $validated['email'];

        if ($request->filled('new_password')) {
            $admin->password = Hash::make($validated['new_password']);
        }

        $admin->save();

        return redirect()->route('admin.profile')
            ->with('success', 'Profile updated successfully.');
    }
} 