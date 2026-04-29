<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller {

    public function index() {
        $bookings = Auth::guard('customer')->user()->bookings()
                ->with(['service', 'technician'])
                ->latest()
                ->paginate(10);

        return view('customer.bookings.index', compact('bookings'));
    }

    public function create(Request $request) {
        if (!$request->has('service')) {
            return redirect()->route('customer.services.index')
                            ->with('error', 'Please select a service to book.');
        }

        $service = Service::where('status', true)
                ->findOrFail($request->service);

        // Get available technicians for this service with their ratings
        $technicians = Technician::whereHas('services', function ($query) use ($service) {
                    $query->where('services.id', $service->id);
                })
//                ->where('is_available', true)
//                ->where('is_approved', true)
                ->withCount(['bookings as completed_bookings' => function ($query) {
                        $query->where('status', 'completed');
                    }])
                ->withAvg('bookings', 'rating')
                ->get();

        if ($technicians->isEmpty()) {
            return redirect()->route('customer.services.show', $service)
                            ->with('error', 'No technicians are currently available for this service.');
        }

        // Get available time slots for the next 7 days
        $timeSlots = $this->getAvailableTimeSlots($service->id);

        return view('customer.bookings.create', compact('service', 'technicians', 'timeSlots'));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'technician_id' => ['required', 'exists:technicians,id'],
            'date' => ['required', 'date', 'after:today'],
            'time_slot' => ['required', 'date_format:Y-m-d H:i:s'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Verify the service is active
        $service = Service::where('status', true)->findOrFail($validated['service_id']);

        // Verify the technician is available and registered for this service
        $isValidTechnician = DB::table('technicians')
                ->join('service_technician', 'technicians.id', '=', 'service_technician.technician_id')
                ->where('technicians.id', $validated['technician_id'])
                ->where('service_technician.service_id', $validated['service_id'])
                ->where('technicians.is_available', true)
                ->where('technicians.status', 'approved')
                ->exists();

        if (!$isValidTechnician) {
            return back()->withErrors(['technician_id' => 'Selected technician is not available for this service.']);
        }

        // Parse the time slot
        $timeSlot = \Carbon\Carbon::parse($validated['time_slot']);
        $bookingDate = $timeSlot->format('Y-m-d');
        $bookingTime = $timeSlot->format('H:i:s');

        // Check if the time slot is available
        $isSlotAvailable = $this->isTimeSlotAvailable(
                $validated['technician_id'],
                $bookingDate,
                $bookingTime,
                $service->duration
        );

        if (!$isSlotAvailable) {
            return back()->withErrors(['time_slot' => 'Selected time slot is not available.']);
        }

        $booking = Auth::guard('customer')->user()->bookings()->create([
            'service_id' => $validated['service_id'],
            'technician_id' => $validated['technician_id'],
            'booking_date' => $bookingDate,
            'booking_time' => $bookingTime,
            'notes' => $validated['notes'],
            'status' => 'pending',
            'total_amount' => $service->price,
        ]);

        return redirect()->route('customer.bookings.show', $booking)
                        ->with('success', 'Booking created successfully.');
    }

    public function show(Booking $booking) {
        // Ensure the booking belongs to the authenticated customer
        if ($booking->customer_id !== Auth::guard('customer')->id()) {
            abort(403);
        }

        $booking->load(['service', 'technician']);
        return view('customer.bookings.show', compact('booking'));
    }

    public function cancel(Booking $booking) {
        // Ensure the booking belongs to the authenticated customer
        if ($booking->customer_id !== Auth::guard('customer')->id()) {
            abort(403);
        }

        // Only allow cancellation of pending bookings
        if ($booking->status !== 'pending') {
            return redirect()->route('customer.bookings.show', $booking)
                            ->with('error', 'Only pending bookings can be cancelled.');
        }

        $booking->update(['status' => 'cancelled']);

        return redirect()->route('customer.bookings.show', $booking)
                        ->with('success', 'Booking cancelled successfully.');
    }

    private function getAvailableTimeSlots($serviceId) {
        $service = Service::findOrFail($serviceId);
        $slots = [];
        $startTime = strtotime('09:00');
        $endTime = strtotime('18:00');
        $interval = 30 * 60; // 30 minutes in seconds

        for ($date = 0; $date < 7; $date++) {
            $currentDate = date('Y-m-d', strtotime("+$date days"));
            $daySlots = [];

            for ($time = $startTime; $time <= $endTime; $time += $interval) {
                $timeSlot = date('Y-m-d H:i:s', strtotime("$currentDate " . date('H:i:s', $time)));
                $daySlots[] = $timeSlot;
            }

            $slots[$currentDate] = $daySlots;
        }

        return $slots;
    }

    private function isTimeSlotAvailable($technicianId, $date, $time, $duration) {
        $startTime = strtotime("$date $time");
        $endTime = strtotime("$date $time + $duration minutes");

        $conflictingBookings = Booking::where('technician_id', $technicianId)
                ->where('booking_date', $date)
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->where(function ($q) use ($startTime, $endTime) {
                        $q->whereRaw("UNIX_TIMESTAMP(CONCAT(booking_date, ' ', booking_time)) BETWEEN ? AND ?", [$startTime, $endTime]);
                    });
                })
                ->where('status', '!=', 'cancelled')
                ->exists();

        return !$conflictingBookings;
    }
}
