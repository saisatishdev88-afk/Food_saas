<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller {

    public function __construct() {
        $this->middleware('auth:customer');
    }

    public function index() {
        $services = Service::where('status', 1)
                ->withCount(['bookings', 'technicians'])
                ->with(['technicians' => function ($query) {
                        $query->where('is_available', true)
                        ->where('status', 'approved');
                    }])
                ->latest()
                ->paginate(9);

        return view('customer.services.index', compact('services'));
    }

    public function show(Service $service) {
        if (!$service->is_active) {
            abort(404);
        }

        // Get available technicians for this service with their ratings and completed bookings
        $technicians = Technician::whereHas('services', function ($query) use ($service) {
                    $query->where('services.id', $service->id);
                })
                ->where('is_available', true)
                ->where('status', 'approved')
                ->withCount(['bookings as completed_bookings' => function ($query) {
                        $query->where('status', 'completed');
                    }])
                ->withAvg('bookings', 'rating')
                ->get();

        // Get service statistics
        $stats = [
            'total_bookings' => $service->bookings()->count(),
            'completed_bookings' => $service->bookings()->where('status', 'completed')->count(),
            'average_rating' => $service->bookings()->whereNotNull('rating')->avg('rating'),
            'available_technicians' => $technicians->count(),
        ];

        return view('customer.services.show', compact('service', 'technicians', 'stats'));
    }
}
