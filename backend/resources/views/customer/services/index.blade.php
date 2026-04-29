@extends('layouts.customer')

@section('title', 'Available Services')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h3 mb-4 text-gray-800">Available Services</h1>
        </div>
    </div>

    <div class="row">
        @forelse($services as $service)
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-primary bg-opacity-10 p-3 rounded me-3">
                            <i class="bi bi-gear text-primary fs-4"></i>
                        </div>
                        <div>
                            <h5 class="card-title mb-0">{{ $service->name }}</h5>
                            <small class="text-muted">{{ $service->duration }} minutes</small>
                        </div>
                    </div>
                    
                    <p class="card-text text-muted">{{ Str::limit($service->description, 100) }}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <span class="h4 mb-0">₹{{ number_format($service->price, 2) }}</span>
                            <small class="text-muted">/service</small>
                        </div>
                        <span class="badge bg-primary">{{ $service->duration }} minutes</span>
                    </div>

                    <div class="mb-4">
                        <h6 class="mb-2">Requirements:</h6>
                        <ul class="list-unstyled mb-0">
                            @foreach(explode(',', $service->requirements) as $requirement)
                            <li class="mb-2 d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                <span>{{ trim($requirement) }}</span>
                            </li>
                            @endforeach
                        </ul>
                    </div>

                    <div class="d-flex gap-2">
                        <a href="{{ route('customer.services.show', $service) }}" class="btn btn-outline-primary flex-grow-1">
                            <i class="bi bi-info-circle me-2"></i>View Details
                        </a>
                        <a href="{{ route('customer.bookings.create', ['service' => $service->id]) }}" class="btn btn-primary flex-grow-1">
                            <i class="bi bi-calendar-plus me-2"></i>Book Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
        @empty
        <div class="col-12">
            <div class="card">
                <div class="card-body text-center py-5">
                    <div class="mb-4">
                        <i class="bi bi-gear text-muted" style="font-size: 4rem;"></i>
                    </div>
                    <h4 class="mb-3">No Services Available</h4>
                    <p class="text-muted mb-4">We're currently updating our service offerings. Please check back later.</p>
                    <a href="{{ route('customer.dashboard') }}" class="btn btn-primary">
                        <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
        @endforelse
    </div>

    @if($services->hasPages())
    <div class="d-flex justify-content-center mt-4">
        {{ $services->links() }}
    </div>
    @endif
</div>
@endsection 