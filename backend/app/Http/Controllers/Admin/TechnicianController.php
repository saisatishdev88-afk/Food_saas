<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\TechnicianStatusUpdated;

class TechnicianController extends Controller
{
    public function index()
    {
        $technicians = Technician::latest()->paginate(10);
        return view('admin.technicians.index', compact('technicians'));
    }

    public function show(Technician $technician)
    {
        return view('admin.technicians.show', compact('technician'));
    }

    public function approve(Technician $technician)
    {
        $technician->update(['status' => 'approved']);
        return redirect()->route('admin.technicians.index')
            ->with('success', 'Technician has been approved successfully.');
    }

    public function reject(Technician $technician)
    {
        $technician->update(['status' => 'rejected']);
        return redirect()->route('admin.technicians.index')
            ->with('success', 'Technician has been rejected.');
    }

    public function create()
    {
        return view('admin.technicians.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:technicians',
            'mobile' => 'required|string',
            'address' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'specialization' => 'nullable|string',
        ]);

        Technician::create([
            'name' => $request->name,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'address' => $request->address,
            'password' => Hash::make($request->password),
            'specialization' => $request->specialization,
            'is_available' => true,
        ]);

        return redirect()->route('admin.technicians.index')
            ->with('success', 'Technician created successfully.');
    }

    public function edit(Technician $technician)
    {
        return view('admin.technicians.edit', compact('technician'));
    }

    public function update(Request $request, Technician $technician)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:technicians,email,' . $technician->id,
            'mobile' => 'required|string',
            'address' => 'required|string',
            'password' => 'nullable|string|min:8|confirmed',
            'specialization' => 'nullable|string',
            'is_available' => 'boolean',
        ]);

        $technician->update([
            'name' => $request->name,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'address' => $request->address,
            'specialization' => $request->specialization,
            'is_available' => $request->is_available ?? true,
        ]);

        if ($request->filled('password')) {
            $technician->update([
                'password' => Hash::make($request->password)
            ]);
        }

        return redirect()->route('admin.technicians.index')
            ->with('success', 'Technician updated successfully.');
    }

    public function destroy(Technician $technician)
    {
        $technician->delete();
        return redirect()->route('admin.technicians.index')
            ->with('success', 'Technician deleted successfully.');
    }
} 