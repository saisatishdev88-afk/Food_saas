@extends('layouts.technician')

@section('title', $service->name)

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-gray-800">{{ $service->name }}</h1>
                <a href="{{ route('technician.services.index') }}" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Services
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="card-title mb-0">Service Information</h5>
                        <span class="badge {{ $service->is_active ? 'bg-success' : 'bg-danger' }}">
                            {{ $service->is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Service Name</h6>
                            <p class="mb-0">{{ $service->name }}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Duration</h6>
                            <p class="mb-0">{{ $service->duration }} minutes</p>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Price</h6>
                            <p class="mb-0">₹{{ number_format($service->price, 2) }}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Total Bookings</h6>
                            <p class="mb-0">{{ $service->bookings_count }}</p>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6 class="text-muted mb-2">Description</h6>
                        <p class="mb-0">{{ $service->description }}</p>
                    </div>

                    <div class="mb-4">
                        <h6 class="text-muted mb-2">Requirements</h6>
                        <ul class="list-unstyled mb-0">
                            @foreach(explode(',', $service->requirements) as $requirement)
                            <li class="mb-2 d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                <span>{{ trim($requirement) }}</span>
                            </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Recent Bookings</h5>
                    @if($service->bookings->isNotEmpty())
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($service->bookings as $booking)
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="bg-light rounded-circle p-2 me-2">
                                                <i class="bi bi-person text-primary"></i>
                                            </div>
                                            <div>
                                                <p class="mb-0">{{ $booking->customer->name }}</p>
                                                <small class="text-muted">{{ $booking->customer->mobile }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{{ $booking->booking_date->format('M d, Y') }}</td>
                                    <td>{{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</td>
                                    <td>
                                        <span class="badge bg-{{ $booking->status_color }}">
                                            {{ ucfirst($booking->status) }}
                                        </span>
                                    </td>
                                    <td>₹{{ number_format($booking->total_amount, 2) }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @else
                    <p class="text-muted mb-0">No bookings found for this service.</p>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title mb-4">Service Statistics</h5>
                    <div class="d-flex flex-column gap-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Total Bookings</h6>
                                <h4 class="mb-0">{{ $service->bookings_count }}</h4>
                            </div>
                            <div class="bg-primary bg-opacity-10 p-3 rounded">
                                <i class="bi bi-calendar-check text-primary fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Pending Bookings</h6>
                                <h4 class="mb-0">{{ $service->bookings->where('status', 'pending')->count() }}</h4>
                            </div>
                            <div class="bg-warning bg-opacity-10 p-3 rounded">
                                <i class="bi bi-clock text-warning fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Completed Bookings</h6>
                                <h4 class="mb-0">{{ $service->bookings->where('status', 'completed')->count() }}</h4>
                            </div>
                            <div class="bg-success bg-opacity-10 p-3 rounded">
                                <i class="bi bi-check-circle text-success fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Total Revenue</h6>
                                <h4 class="mb-0">₹{{ number_format($service->bookings->where('status', 'completed')->sum('total_amount'), 2) }}</h4>
                            </div>
                            <div class="bg-info bg-opacity-10 p-3 rounded">
                                <i class="bi bi-currency-rupee text-info fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Average Rating</h6>
                                <h4 class="mb-0">
                                    {{ number_format($service->bookings->whereNotNull('rating')->avg('rating'), 1) }}
                                    <small class="text-muted">/ 5.0</small>
                                </h4>
                            </div>
                            <div class="bg-warning bg-opacity-10 p-3 rounded">
                                <i class="bi bi-star text-warning fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Service Notes</h5>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Important:</strong> Make sure to review the service requirements before each booking.
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
                            <span>Follow safety protocols at all times</span>
                        </li>
                        <li class="d-flex align-items-start">
                            <i class="bi bi-check-circle text-primary me-2 mt-1"></i>
                            <span>Update booking status promptly</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 