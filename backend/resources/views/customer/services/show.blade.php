@extends('layouts.customer')

@section('title', $service->name)

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-gray-800">{{ $service->name }}</h1>
                <a href="{{ route('customer.services.index') }}" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Services
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Service Details -->
        <div class="col-lg-8">
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-4">
                        <div class="bg-primary bg-opacity-10 p-3 rounded me-3">
                            <i class="bi bi-gear text-primary fs-4"></i>
                        </div>
                        <div>
                            <h5 class="card-title mb-1">{{ $service->name }}</h5>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-primary me-2">{{ $service->duration }} minutes</span>
                                <span class="text-muted">₹{{ number_format($service->price, 2) }}</span>
                            </div>
                        </div>
                    </div>

                    <h6 class="mb-3">Description</h6>
                    <p class="text-muted mb-4">{{ $service->description }}</p>

                    <h6 class="mb-3">Requirements</h6>
                    <p class="text-muted">{{ $service->requirements }}</p>
                </div>
            </div>

            <!-- Service Statistics -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title mb-4">Service Statistics</h5>
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-primary bg-opacity-10 p-2 rounded me-3">
                                    <i class="bi bi-calendar-check text-primary"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0">{{ $stats['total_bookings'] }}</h6>
                                    <small class="text-muted">Total Bookings</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-success bg-opacity-10 p-2 rounded me-3">
                                    <i class="bi bi-check-circle text-success"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0">{{ $stats['completed_bookings'] }}</h6>
                                    <small class="text-muted">Completed</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-warning bg-opacity-10 p-2 rounded me-3">
                                    <i class="bi bi-star text-warning"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0">{{ number_format($stats['average_rating'], 1) }}</h6>
                                    <small class="text-muted">Average Rating</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-info bg-opacity-10 p-2 rounded me-3">
                                    <i class="bi bi-people text-info"></i>
                                </div>
                                <div>
                                    <h6 class="mb-0">{{ $stats['available_technicians'] }}</h6>
                                    <small class="text-muted">Available Techs</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Available Technicians -->
        <div class="col-lg-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Available Technicians</h5>
                    @forelse($technicians as $technician)
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-light rounded-circle p-2 me-3">
                            <i class="bi bi-person text-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="mb-1">{{ $technician->name }}</h6>
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <i class="bi bi-star-fill text-warning"></i>
                                    <span class="ms-1">{{ number_format($technician->rating, 1) }}</span>
                                </div>
                                <div>
                                    <i class="bi bi-check-circle-fill text-success"></i>
                                    <span class="ms-1">{{ $technician->completed_bookings }} completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        No technicians are currently available for this service.
                    </div>
                    @endforelse

                    @if($technicians->isNotEmpty())
                    <a href="{{ route('customer.bookings.create', ['service' => $service->id]) }}" class="btn btn-primary w-100 mt-3">
                        <i class="bi bi-calendar-plus me-2"></i>Book Now
                    </a>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 