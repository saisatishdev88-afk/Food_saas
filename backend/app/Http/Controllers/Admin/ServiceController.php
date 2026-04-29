<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Technician;
use Illuminate\Http\Request;

class ServiceController extends Controller {

    public function index() {
        $services = Service::withCount(['bookings', 'technicians'])
                ->latest()
                ->paginate(10);

        return view('admin.services.index', compact('services'));
    }

    public function create() {
        $technicians = Technician::where('is_available', true)->get();
        return view('admin.services.create', compact('technicians'));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'nullable|integer|min:1',
            'status' => 'boolean'
        ]);

        $service = Service::create([
                    'name' => $validated['name'],
                    'description' => $validated['description'],
                    'price' => $validated['price'],
                    'duration_minutes' => $validated['duration_minutes'] ?? 60,
                    'status' => $request->boolean('status', true)
        ]);

        return redirect()
                        ->route('admin.services.index')
                        ->with('success', 'Service created successfully.');
    }

    public function show(Service $service) {
        $service->load(['bookings' => function ($query) {
                $query->latest()->take(5);
            }, 'technicians']);

        $stats = [
            'total_bookings' => $service->bookings()->count(),
            'pending_bookings' => $service->bookings()->where('status', 'pending')->count(),
            'completed_bookings' => $service->bookings()->where('status', 'completed')->count(),
            'total_revenue' => $service->bookings()->where('status', 'completed')->sum('total_amount'),
            'average_rating' => $service->bookings()->whereNotNull('rating')->avg('rating'),
        ];

        return view('admin.services.show', compact('service', 'stats'));
    }

    public function edit(Service $service) {
        $technicians = Technician::where('is_available', true)->get();
        $service->load('technicians');
        return view('admin.services.edit', compact('service', 'technicians'));
    }

    public function update(Request $request, Service $service) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'is_active' => 'boolean'
        ]);

        $service->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'duration_minutes' => $validated['duration_minutes'],
            'is_active' => $request->boolean('is_active', true)
        ]);

        return redirect()
                        ->route('admin.services.index')
                        ->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service) {
        $service->delete();
        return redirect()
                        ->route('admin.services.index')
                        ->with('success', 'Service deleted successfully.');
    }
}
