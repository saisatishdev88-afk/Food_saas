@extends('layouts.technician')

@section('title', 'Booking Details')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-gray-800">Booking Details</h1>
                <a href="{{ route('technician.bookings.index') }}" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Bookings
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 class="card-title mb-1">Booking #{{ $booking->id }}</h5>
                            <p class="text-muted mb-0">Created {{ $booking->created_at->format('M d, Y h:i A') }}</p>
                        </div>
                        <span class="badge bg-{{ $booking->status_color }}">
                            {{ ucfirst($booking->status) }}
                        </span>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Customer Information</h6>
                            <div class="d-flex align-items-center">
                                <div class="bg-light rounded-circle p-2 me-3">
                                    <i class="bi bi-person text-primary"></i>
                                </div>
                                <div>
                                    <p class="mb-0">{{ $booking->customer->name }}</p>
                                    <small class="text-muted">{{ $booking->customer->mobile }}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Service Information</h6>
                            <div class="d-flex align-items-center">
                                <div class="bg-light rounded-circle p-2 me-3">
                                    <i class="bi bi-gear text-primary"></i>
                                </div>
                                <div>
                                    <p class="mb-0">{{ $booking->service->name }}</p>
                                    <small class="text-muted">{{ $booking->service->duration }} minutes</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Booking Date</h6>
                            <p class="mb-0">{{ $booking->booking_date->format('M d, Y') }}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Booking Time</h6>
                            <p class="mb-0">{{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</p>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Amount</h6>
                            <p class="mb-0">₹{{ number_format($booking->total_amount, 2) }}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Payment Status</h6>
                            <p class="mb-0">Payment at service</p>
                        </div>
                    </div>

                    @if($booking->notes)
                    <div class="mb-4">
                        <h6 class="text-muted mb-2">Additional Notes</h6>
                        <p class="mb-0">{{ $booking->notes }}</p>
                    </div>
                    @endif

                    @if($booking->status === 'completed' && $booking->rating)
                    <div class="mb-4">
                        <h6 class="text-muted mb-2">Customer Review</h6>
                        <div class="d-flex align-items-center mb-2">
                            <div class="text-warning me-2">
                                @for($i = 1; $i <= 5; $i++)
                                    <i class="bi bi-star{{ $i <= $booking->rating ? '-fill' : '' }}"></i>
                                @endfor
                            </div>
                            <span class="text-muted">{{ $booking->rating }}/5</span>
                        </div>
                        @if($booking->review)
                        <p class="mb-0">{{ $booking->review }}</p>
                        @endif
                    </div>
                    @endif
                </div>
            </div>

            @if($booking->status === 'pending' || $booking->status === 'confirmed')
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Update Booking Status</h5>
                    <form action="{{ route('technician.bookings.update-status', $booking) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="mb-3">
                            <label class="form-label">Status</label>
                            <select name="status" class="form-select">
                                @if($booking->status === 'pending')
                                <option value="confirmed">Confirm Booking</option>
                                <option value="cancelled">Cancel Booking</option>
                                @elseif($booking->status === 'confirmed')
                                <option value="completed">Mark as Completed</option>
                                <option value="cancelled">Cancel Booking</option>
                                @endif
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-check-lg me-2"></i>Update Status
                        </button>
                    </form>
                </div>
            </div>
            @endif
        </div>

        <div class="col-lg-4">
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title mb-4">Service Requirements</h5>
                    <ul class="list-unstyled mb-0">
                        @foreach(explode(',', $booking->service->requirements) as $requirement)
                        <li class="mb-2 d-flex align-items-start">
                            <i class="bi bi-check-circle text-primary me-2 mt-1"></i>
                            <span>{{ trim($requirement) }}</span>
                        </li>
                        @endforeach
                    </ul>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Important Notes</h5>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Remember:</strong> Make sure to follow all safety protocols and service requirements.
                    </div>
                    <ul class="list-unstyled mb-0">
                        <li class="mb-2 d-flex align-items-start">
                            <i class="bi bi-check-circle text-primary me-2 mt-1"></i>
                            <span>Arrive 15 minutes before the scheduled time</span>
                        </li>
                        <li class="mb-2 d-flex align-items-start">
                            <i class="bi bi-check-circle text-primary me-2 mt-1"></i>
                            <span>Bring all necessary tools and equipment</span>
                        </li>
                        <li class="mb-2 d-flex align-items-start">
                            <i class="bi bi-check-circle text-primary me-2 mt-1"></i>
                            <span>Wear appropriate safety gear</span>
                        </li>
                        <li class="d-flex align-items-start">
                            <i class="bi bi-check-circle text-primary me-2 mt-1"></i>
                            <span>Update booking status after completion</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 