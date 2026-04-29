<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller {

    public function index() {
        $customer = Auth::guard('customer')->user();

        $stats = [
            'total_bookings' => Booking::where('customer_id', $customer->id)->count(),
            'pending_bookings' => Booking::where('customer_id', $customer->id)
                    ->where('status', 'pending')
                    ->count(),
            'completed_bookings' => Booking::where('customer_id', $customer->id)
                    ->where('status', 'completed')
                    ->count(),
            'recent_bookings' => Booking::with(['technician', 'service'])
                    ->where('customer_id', $customer->id)
                    ->latest()
                    ->take(5)
                    ->get(),
            'available_services' => Service::where('status', true)->get(),
        ];

        return view('customer.dashboard', compact('stats'));
    }
}
