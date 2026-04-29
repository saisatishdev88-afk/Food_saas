@extends('layouts.technician')

@section('title', 'My Services')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-gray-800">My Services</h1>
            </div>
        </div>
    </div>

    <div class="row">
        @forelse($services as $service)
        <div class="col-md-6 col-lg-6 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title mb-1">{{ $service->name }}</h5>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-primary me-2">{{ $service->duration }} minutes</span>
                                <span class="text-muted">₹{{ number_format($service->price, 2) }}</span>
                            </div>
                        </div>
                        <span class="badge {{ $service->is_active ? 'bg-success' : 'bg-danger' }}">
                            {{ $service->is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <p class="card-text text-muted mb-3">{{ Str::limit($service->description, 100) }}</p>

                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="bi bi-calendar-check text-primary"></i>
                        </div>
                        <div>
                            <h6 class="mb-0">{{ $service->bookings_count }}</h6>
                            <small class="text-muted">Total Bookings</small>
                        </div>
                    </div>

                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="bi bi-star text-warning"></i>
                        </div>
                        <div>
                            <h6 class="mb-0">
                                {{ number_format($service->bookings->whereNotNull('rating')->avg('rating'), 1) }}
                                <small class="text-muted">/ 5.0</small>
                            </h6>
                            <small class="text-muted">Average Rating</small>
                        </div>
                    </div>

                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="bi bi-currency-rupee text-info"></i>
                        </div>
                        <div>
                            <h6 class="mb-0">₹{{ number_format($service->bookings->where('status', 'completed')->sum('total_amount'), 2) }}</h6>
                            <small class="text-muted">Total Revenue</small>
                        </div>
                    </div>

                    <hr class="my-3">

                    <div class="d-flex justify-content-between align-items-center">
                        <a href="{{ route('technician.services.show', $service) }}" class="btn btn-primary">
                            <i class="bi bi-eye me-2"></i>View Details
                        </a>
                        <div class="dropdown">
                            <button class="btn btn-light" type="button" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item" href="{{ route('technician.services.show', $service) }}">
                                        <i class="bi bi-eye me-2"></i>View Details
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="{{ route('technician.bookings.index', ['service' => $service->id]) }}">
                                        <i class="bi bi-calendar me-2"></i>View Bookings
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @empty
        <div class="col-12">
            <div class="card">
                <div class="card-body text-center py-5">
                    <div class="mb-3">
                        <i class="bi bi-gear text-muted" style="font-size: 3rem;"></i>
                    </div>
                    <h5 class="text-muted mb-3">No Services Found</h5>
                    <p class="text-muted mb-0">You haven't been assigned to any services yet.</p>
                </div>
            </div>
        </div>
        @endforelse
    </div>

    @if($services->hasPages())
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-center mt-4">
                {{ $services->links() }}
            </div>
        </div>
    </div>
    @endif
</div>
@endsection