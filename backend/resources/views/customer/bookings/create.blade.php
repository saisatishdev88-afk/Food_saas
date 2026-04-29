@extends('layouts.customer')

@section('title', 'Book Service')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-gray-800">Book Service</h1>
                <a href="{{ route('customer.services.show', $service) }}" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Service
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card">
                <div class="card-body">
                    <form action="{{ route('customer.bookings.store') }}" method="POST">
                        @csrf
                        <input type="hidden" name="service_id" value="{{ $service->id }}">

                        <!-- Service Details -->
                        <div class="mb-4">
                            <h5 class="card-title mb-3">Service Details</h5>
                            <div class="d-flex align-items-center">
                                <div class="bg-primary bg-opacity-10 p-3 rounded me-3">
                                    <i class="bi bi-gear text-primary fs-4"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">{{ $service->name }}</h6>
                                    <div class="d-flex align-items-center">
                                        <span class="badge bg-primary me-2">{{ $service->duration }} minutes</span>
                                        <span class="text-muted">₹{{ number_format($service->price, 2) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Technician Selection -->
                        <div class="mb-4">
                            <label class="form-label">Select Technician</label>
                            <select name="technician_id" class="form-select @error('technician_id') is-invalid @enderror" required>
                                <option value="">Choose a technician...</option>
                                @foreach($technicians as $technician)
                                <option value="{{ $technician->id }}" {{ old('technician_id') == $technician->id ? 'selected' : '' }}>
                                    {{ $technician->name }} 
                                    (Rating: {{ number_format($technician->rating, 1) }} | 
                                    {{ $technician->completed_bookings }} completed)
                                </option>
                                @endforeach
                            </select>
                            @error('technician_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <!-- Date Selection -->
                        <div class="mb-4">
                            <label class="form-label">Select Date</label>
                            <select name="date" class="form-select @error('date') is-invalid @enderror" required>
                                <option value="">Choose a date...</option>
                                @foreach($timeSlots as $date => $slots)
                                <option value="{{ $date }}" {{ old('date') == $date ? 'selected' : '' }}>
                                    {{ \Carbon\Carbon::parse($date)->format('l, F j, Y') }}
                                </option>
                                @endforeach
                            </select>
                            @error('date')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <!-- Time Slot Selection -->
                        <div class="mb-4">
                            <label class="form-label">Select Time Slot</label>
                            <select name="time_slot" class="form-select @error('time_slot') is-invalid @enderror" required>
                                <option value="">Choose a time slot...</option>
                                @foreach($timeSlots as $date => $slots)
                                <optgroup label="{{ \Carbon\Carbon::parse($date)->format('l, F j, Y') }}" class="date-group" data-date="{{ $date }}" style="display: none;">
                                    @foreach($slots as $slot)
                                    <option value="{{ $slot }}" {{ old('time_slot') == $slot ? 'selected' : '' }}>
                                        {{ \Carbon\Carbon::parse($slot)->format('g:i A') }}
                                    </option>
                                    @endforeach
                                </optgroup>
                                @endforeach
                            </select>
                            @error('time_slot')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <!-- Additional Notes -->
                        <div class="mb-4">
                            <label class="form-label">Additional Notes (Optional)</label>
                            <textarea name="notes" class="form-control @error('notes') is-invalid @enderror" rows="3" placeholder="Any special requirements or instructions...">{{ old('notes') }}</textarea>
                            @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-calendar-check me-2"></i>Confirm Booking
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Booking Summary -->
        <div class="col-lg-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Booking Summary</h5>
                    
                    <div class="mb-4">
                        <h6 class="text-muted mb-3">Service Information</h6>
                        <ul class="list-unstyled mb-0">
                            <li class="mb-2 d-flex align-items-start">
                                <i class="bi bi-clock text-primary me-2 mt-1"></i>
                                <div>
                                    <h6 class="mb-1">Duration</h6>
                                    <p class="text-muted mb-0">{{ $service->duration }} minutes</p>
                                </div>
                            </li>
                            <li class="mb-2 d-flex align-items-start">
                                <i class="bi bi-currency-rupee text-primary me-2 mt-1"></i>
                                <div>
                                    <h6 class="mb-1">Price</h6>
                                    <p class="text-muted mb-0">₹{{ number_format($service->price, 2) }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="mb-4">
                        <h6 class="text-muted mb-3">Booking Policy</h6>
                        <ul class="list-unstyled mb-0">
                            <li class="mb-2 d-flex align-items-start">
                                <i class="bi bi-info-circle text-primary me-2 mt-1"></i>
                                <span>Bookings can be made up to 7 days in advance</span>
                            </li>
                            <li class="mb-2 d-flex align-items-start">
                                <i class="bi bi-clock text-primary me-2 mt-1"></i>
                                <span>Service hours: 9:00 AM to 6:00 PM</span>
                            </li>
                            <li class="mb-2 d-flex align-items-start">
                                <i class="bi bi-x-circle text-primary me-2 mt-1"></i>
                                <span>Cancellations must be made at least 24 hours before the scheduled time</span>
                            </li>
                            <li class="d-flex align-items-start">
                                <i class="bi bi-currency-rupee text-primary me-2 mt-1"></i>
                                <span>Payment is due at the time of service</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const dateSelect = document.querySelector('select[name="date"]');
    const timeSlotSelect = document.querySelector('select[name="time_slot"]');
    const dateGroups = document.querySelectorAll('.date-group');

    function updateTimeSlots() {
        const selectedDate = dateSelect.value;
        
        // Hide all date groups
        dateGroups.forEach(group => {
            group.style.display = 'none';
        });

        // Show selected date group
        if (selectedDate) {
            const selectedGroup = document.querySelector(`.date-group[data-date="${selectedDate}"]`);
            if (selectedGroup) {
                selectedGroup.style.display = '';
            }
        }

        // Reset time slot selection
        timeSlotSelect.value = '';
    }

    dateSelect.addEventListener('change', updateTimeSlots);

    // Initialize time slots on page load
    updateTimeSlots();
});
</script>
@endpush
@endsection 