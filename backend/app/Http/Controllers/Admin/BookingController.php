<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Technician;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with(['customer', 'technician', 'service'])
            ->latest()
            ->paginate(10);

        return view('admin.bookings.index', compact('bookings'));
    }

    public function show(Booking $booking)
    {
        $booking->load(['customer', 'technician', 'service']);
        $technicians = Technician::where('is_available', true)->get();
        
        return view('admin.bookings.show', compact('booking', 'technicians'));
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled'
        ]);

        $booking->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', 'Booking status updated successfully.');
    }

    public function assignTechnician(Request $request, Booking $booking)
    {
        $request->validate([
            'technician_id' => 'required|exists:technicians,id'
        ]);

        $booking->update([
            'technician_id' => $request->technician_id
        ]);

        return redirect()->back()->with('success', 'Technician assigned successfully.');
    }
} 