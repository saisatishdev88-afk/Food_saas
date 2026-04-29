@extends('layouts.customer')

@section('title', 'Booking Details')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-gray-800">Booking Details</h1>
                <a href="{{ route('customer.bookings.index') }}" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Bookings
                </a>
            </div>
        </div>
    </div>

    @if (session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle me-2"></i>
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    @endif

    @if (session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>
        {{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    @endif

    <div class="row">
        <div class="col-lg-8">
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-4">
                        <div class="bg-primary bg-opacity-10 p-3 rounded me-3">
                            <i class="bi bi-calendar-check text-primary fs-4"></i>
                        </div>
                        <div>
                            <h5 class="card-title mb-1">Booking #{{ $booking->id }}</h5>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-{{ $booking->status === 'pending' ? 'warning' : ($booking->status === 'completed' ? 'success' : 'danger') }} me-2">
                                    {{ ucfirst($booking->status) }}
                                </span>
                                <span class="text-muted">Created {{ $booking->created_at->diffForHumans() }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <h6 class="mb-3">Service Details</h6>
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-gear text-muted me-2"></i>
                                <span>{{ $booking->service->name }}</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-clock text-muted me-2"></i>
                                <span>{{ $booking->service->duration }} minutes</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="bi bi-currency-rupee text-muted me-2"></i>
                                <span>₹{{ number_format($booking->amount, 2) }}</span>
                            </div>
                        </div>

                        <div class="col-md-6 mb-4">
                            <h6 class="mb-3">Booking Schedule</h6>
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-calendar-date text-muted me-2"></i>
                                <span>{{ $booking->booking_date->format('F j, Y') }}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="bi bi-clock text-muted me-2"></i>
                                <span>{{ $booking->booking_time }}</span>
                            </div>
                        </div>
                    </div>

                    @if($booking->technician)
                    <div class="mb-4">
                        <h6 class="mb-3">Assigned Technician</h6>
                        <div class="d-flex align-items-center">
                            <div class="bg-light rounded-circle p-2 me-3">
                                <i class="bi bi-person text-primary"></i>
                            </div>
                            <div>
                                <p class="mb-0">{{ $booking->technician->name }}</p>
                                <small class="text-muted">{{ $booking->technician->specialization }}</small>
                            </div>
                        </div>
                    </div>
                    @endif

                    @if($booking->notes)
                    <div class="mb-4">
                        <h6 class="mb-3">Additional Notes</h6>
                        <p class="text-muted mb-0">{{ $booking->notes }}</p>
                    </div>
                    @endif

                    @if($booking->status === 'pending')
                    <div class="d-flex gap-2">
                        <form action="{{ route('customer.bookings.cancel', $booking) }}" method="POST" class="d-inline">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to cancel this booking?')">
                                <i class="bi bi-x-circle me-2"></i>Cancel Booking
                            </button>
                        </form>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Booking Status</h5>
                    
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-marker bg-success"></div>
                            <div class="timeline-content">
                                <h6 class="mb-0">Booking Created</h6>
                                <small class="text-muted">{{ $booking->created_at->format('M j, Y g:i A') }}</small>
                            </div>
                        </div>

                        @if($booking->technician_id)
                        <div class="timeline-item">
                            <div class="timeline-marker bg-primary"></div>
                            <div class="timeline-content">
                                <h6 class="mb-0">Technician Assigned</h6>
                                <small class="text-muted">{{ $booking->updated_at->format('M j, Y g:i A') }}</small>
                            </div>
                        </div>
                        @endif

                        @if($booking->status === 'completed')
                        <div class="timeline-item">
                            <div class="timeline-marker bg-success"></div>
                            <div class="timeline-content">
                                <h6 class="mb-0">Service Completed</h6>
                                <small class="text-muted">{{ $booking->updated_at->format('M j, Y g:i A') }}</small>
                            </div>
                        </div>
                        @endif

                        @if($booking->status === 'cancelled')
                        <div class="timeline-item">
                            <div class="timeline-marker bg-danger"></div>
                            <div class="timeline-content">
                                <h6 class="mb-0">Booking Cancelled</h6>
                                <small class="text-muted">{{ $booking->updated_at->format('M j, Y g:i A') }}</small>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.timeline {
    position: relative;
    padding-left: 30px;
}

.timeline-item {
    position: relative;
    padding-bottom: 1.5rem;
}

.timeline-item:last-child {
    padding-bottom: 0;
}

.timeline-marker {
    position: absolute;
    left: -30px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
}

.timeline-item:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -23px;
    top: 15px;
    height: calc(100% - 15px);
    width: 2px;
    background-color: #e9ecef;
}
</style>
@endsection 