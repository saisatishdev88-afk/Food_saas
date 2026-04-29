@extends('layouts.customer')

@section('title', 'Dashboard')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h3 mb-4 text-gray-800">Dashboard</h1>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-2">Total Bookings</h6>
                            <h3 class="mb-0">{{ $stats['total_bookings'] }}</h3>
                        </div>
                        <div class="bg-primary bg-opacity-10 p-3 rounded">
                            <i class="bi bi-calendar-check text-primary fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-2">Pending Bookings</h6>
                            <h3 class="mb-0">{{ $stats['pending_bookings'] }}</h3>
                        </div>
                        <div class="bg-warning bg-opacity-10 p-3 rounded">
                            <i class="bi bi-clock text-warning fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-muted mb-2">Completed Services</h6>
                            <h3 class="mb-0">{{ $stats['completed_bookings'] }}</h3>
                        </div>
                        <div class="bg-success bg-opacity-10 p-3 rounded">
                            <i class="bi bi-check-circle text-success fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Bookings -->
    <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Bookings</h5>
            <a href="{{ route('customer.bookings.index') }}" class="btn btn-primary btn-sm">
                <i class="bi bi-list-ul me-2"></i>View All
            </a>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Technician</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($stats['recent_bookings'] as $booking)
                        <tr>
                            <td>{{ $booking->service->name }}</td>
                            <td>{{ $booking->booking_date->format('M d, Y') }}</td>
                            <td>
                                @if($booking->technician)
                                    {{ $booking->technician->name }}
                                @else
                                    <span class="text-muted">Not Assigned</span>
                                @endif
                            </td>
                            <td>
                                <span class="badge bg-{{ $booking->status_color }}">
                                    {{ $booking->status }}
                                </span>
                            </td>
                            <td>₹{{ number_format($booking->total_amount, 2) }}</td>
                            <td>
                                <a href="{{ route('customer.bookings.show', $booking) }}" class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-eye"></i> View
                                </a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <div class="text-muted">No bookings found</div>
                                <a href="{{ route('customer.services.index') }}" class="btn btn-primary mt-3">
                                    <i class="bi bi-plus-lg me-2"></i>Book a Service
                                </a>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Available Services -->
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Available Services</h5>
            <a href="{{ route('customer.services.index') }}" class="btn btn-primary btn-sm">
                <i class="bi bi-grid me-2"></i>View All
            </a>
        </div>
        <div class="card-body">
            <div class="row">
                @forelse($stats['available_services'] as $service)
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">{{ $service->name }}</h5>
                            <p class="card-text text-muted">{{ Str::limit($service->description, 100) }}</p>
                            
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <span class="h4 mb-0">₹{{ number_format($service->price, 2) }}</span>
                                    <small class="text-muted">/service</small>
                                </div>
                                <span class="badge bg-primary">{{ $service->duration }} minutes</span>
                            </div>

                            <a href="{{ route('customer.bookings.create', ['service' => $service->id]) }}" class="btn btn-primary w-100">
                                <i class="bi bi-calendar-plus me-2"></i>Book Now
                            </a>
                        </div>
                    </div>
                </div>
                @empty
                <div class="col-12">
                    <div class="text-center py-4">
                        <i class="bi bi-gear text-muted" style="font-size: 3rem;"></i>
                        <h5 class="mt-3">No Services Available</h5>
                        <p class="text-muted">Please check back later for available services.</p>
                    </div>
                </div>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection 