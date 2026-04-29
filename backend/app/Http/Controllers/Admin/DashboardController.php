<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Technician;
use App\Models\Service;
use App\Models\Booking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_customers' => Customer::count(),
            'total_technicians' => Technician::count(),
            'total_services' => Service::count(),
            'total_bookings' => Booking::count(),
            'recent_bookings' => Booking::with(['customer', 'technician', 'service'])
                ->latest()
                ->take(5)
                ->get(),
        ];

        return view('admin.dashboard', compact('stats'));
    }
} 