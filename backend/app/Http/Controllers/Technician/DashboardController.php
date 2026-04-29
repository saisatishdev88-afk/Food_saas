<?php

namespace App\Http\Controllers\Technician;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller {

    public function index() {
        $technician = Auth::guard('technician')->user();

        // Get the technician's registered service IDs using a join
        $serviceIds = DB::table('services')
                ->join('service_technician', 'services.id', '=', 'service_technician.service_id')
                ->where('service_technician.technician_id', $technician->id)
                ->pluck('services.id');

        $stats = [
            'total_bookings' => Booking::whereIn('service_id', $serviceIds)
                    ->where('technician_id', $technician->id)
                    ->count(),
            'pending_bookings' => Booking::whereIn('service_id', $serviceIds)
                    ->where('technician_id', $technician->id)
                    ->where('status', 'pending')
                    ->count(),
            'in_progress_bookings' => Booking::whereIn('service_id', $serviceIds)
                    ->where('technician_id', $technician->id)
                    ->where('status', 'confirmed')
                    ->count(),
            'completed_bookings' => Booking::whereIn('service_id', $serviceIds)
                    ->where('technician_id', $technician->id)
                    ->where('status', 'completed')
                    ->count(),
            'recent_bookings' => Booking::with(['customer', 'service'])
                    ->whereIn('service_id', $serviceIds)
                    ->where('technician_id', $technician->id)
                    ->latest()
                    ->take(5)
                    ->get(),
        ];

        return view('technician.dashboard', compact('stats'));
    }
}
