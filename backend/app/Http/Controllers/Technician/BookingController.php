<?php

namespace App\Http\Controllers\Technician;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $technician = Auth::guard('technician')->user();
        
        // Get the technician's registered service IDs using a join
        $serviceIds = DB::table('services')
            ->join('service_technician', 'services.id', '=', 'service_technician.service_id')
            ->where('service_technician.technician_id', $technician->id)
            ->pluck('services.id');

        $query = Booking::whereIn('service_id', $serviceIds)
            ->where('technician_id', $technician->id)
            ->with(['customer', 'service']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest()->paginate(10);

        return view('technician.bookings.index', compact('bookings'));
    }

    public function show(Booking $booking)
    {
        $technician = Auth::guard('technician')->user();
        
        // Check if the booking's service is registered for this technician using a join
        $isRegisteredService = DB::table('services')
            ->join('service_technician', 'services.id', '=', 'service_technician.service_id')
            ->where('service_technician.technician_id', $technician->id)
            ->where('services.id', $booking->service_id)
            ->exists();
        
        // Ensure the booking belongs to the authenticated technician and is for their registered service
        if ($booking->technician_id !== $technician->id || !$isRegisteredService) {
            abort(403);
        }

        $booking->load(['customer', 'service']);
        return view('technician.bookings.show', compact('booking'));
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $technician = Auth::guard('technician')->user();
        
        // Check if the booking's service is registered for this technician
        $isRegisteredService = DB::table('services')
            ->join('service_technician', 'services.id', '=', 'service_technician.service_id')
            ->where('service_technician.technician_id', $technician->id)
            ->where('services.id', $booking->service_id)
            ->exists();
        
        // Ensure the booking belongs to the authenticated technician and is for their registered service
        if ($booking->technician_id !== $technician->id || !$isRegisteredService) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled'
        ]);

        $booking->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', 'Booking status updated successfully.');
    }

    public function update(Request $request, Booking $booking)
    {
        $technician = Auth::guard('technician')->user();
        
        // Check if the booking's service is registered for this technician using a join
        $isRegisteredService = DB::table('services')
            ->join('service_technician', 'services.id', '=', 'service_technician.service_id')
            ->where('service_technician.technician_id', $technician->id)
            ->where('services.id', $booking->service_id)
            ->exists();
        
        // Ensure the booking belongs to the authenticated technician and is for their registered service
        if ($booking->technician_id !== $technician->id || !$isRegisteredService) {
            abort(403);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
            'completion_notes' => 'nullable|string|max:1000',
            'rating' => 'nullable|integer|min:1|max:5'
        ]);

        $booking->update($request->only(['notes', 'completion_notes', 'rating']));

        return redirect()->route('technician.bookings.show', $booking)
            ->with('success', 'Booking updated successfully.');
    }
} 