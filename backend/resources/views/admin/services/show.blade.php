@extends('layouts.admin')

@section('title', 'Service Details')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 text-gray-800">Service Details</h1>
        <div>
            <a href="{{ route('admin.services.edit', $service) }}" class="btn btn-primary">
                <i class="bi bi-pencil me-2"></i>Edit Service
            </a>
            <a href="{{ route('admin.services.index') }}" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-2"></i>Back to Services
            </a>
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
                            <p class="mb-0">{{ $stats['total_bookings'] }}</p>
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

                    <div class="mb-4">
                        <h6 class="text-muted mb-2">Assigned Technicians</h6>
                        <div class="row">
                            @forelse($service->technicians as $technician)
                            <div class="col-md-6 mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-light rounded-circle p-2 me-3">
                                        <i class="bi bi-person text-primary"></i>
                                    </div>
                                    <div>
                                        <p class="mb-0">{{ $technician->name }}</p>
                                        <small class="text-muted">{{ $technician->specialization }}</small>
                                    </div>
                                </div>
                            </div>
                            @empty
                            <div class="col-12">
                                <p class="text-muted mb-0">No technicians assigned to this service.</p>
                            </div>
                            @endforelse
                        </div>
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
                                    <th>Technician</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($service->bookings as $booking)
                                <tr>
                                    <td>{{ $booking->customer->name }}</td>
                                    <td>{{ $booking->technician->name }}</td>
                                    <td>{{ $booking->booking_date->format('M d, Y') }}</td>
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
                                <h4 class="mb-0">{{ $stats['total_bookings'] }}</h4>
                            </div>
                            <div class="bg-primary bg-opacity-10 p-3 rounded">
                                <i class="bi bi-calendar-check text-primary fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Pending Bookings</h6>
                                <h4 class="mb-0">{{ $stats['pending_bookings'] }}</h4>
                            </div>
                            <div class="bg-warning bg-opacity-10 p-3 rounded">
                                <i class="bi bi-clock text-warning fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Completed Bookings</h6>
                                <h4 class="mb-0">{{ $stats['completed_bookings'] }}</h4>
                            </div>
                            <div class="bg-success bg-opacity-10 p-3 rounded">
                                <i class="bi bi-check-circle text-success fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Total Revenue</h6>
                                <h4 class="mb-0">₹{{ number_format($stats['total_revenue'], 2) }}</h4>
                            </div>
                            <div class="bg-info bg-opacity-10 p-3 rounded">
                                <i class="bi bi-currency-rupee text-info fs-4"></i>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Average Rating</h6>
                                <h4 class="mb-0">
                                    {{ number_format($stats['average_rating'], 1) }}
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
                    <h5 class="card-title mb-4">Quick Actions</h5>
                    <div class="d-grid gap-2">
                        <a href="{{ route('admin.services.edit', $service) }}" class="btn btn-primary">
                            <i class="bi bi-pencil me-2"></i>Edit Service
                        </a>
                        <form action="{{ route('admin.services.destroy', $service) }}" method="POST" class="d-grid">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this service?')">
                                <i class="bi bi-trash me-2"></i>Delete Service
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 