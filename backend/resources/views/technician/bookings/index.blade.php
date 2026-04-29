@extends('layouts.technician')

@section('title', 'My Bookings')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-gray-800">My Bookings</h1>
                <div class="d-flex gap-2">
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-funnel me-2"></i>Filter
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="{{ route('technician.bookings.index') }}">All Bookings</a></li>
                            <li><a class="dropdown-item" href="{{ route('technician.bookings.index', ['status' => 'pending']) }}">Pending</a></li>
                            <li><a class="dropdown-item" href="{{ route('technician.bookings.index', ['status' => 'confirmed']) }}">Confirmed</a></li>
                            <li><a class="dropdown-item" href="{{ route('technician.bookings.index', ['status' => 'completed']) }}">Completed</a></li>
                            <li><a class="dropdown-item" href="{{ route('technician.bookings.index', ['status' => 'cancelled']) }}">Cancelled</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    @if($bookings->isNotEmpty())
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($bookings as $booking)
                                <tr>
                                    <td>
                                        <span class="fw-bold">#{{ $booking->id }}</span>
                                    </td>
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
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="bg-light rounded-circle p-2 me-2">
                                                <i class="bi bi-gear text-primary"></i>
                                            </div>
                                            <div>
                                                <p class="mb-0">{{ $booking->service->name }}</p>
                                                <small class="text-muted">{{ $booking->service->duration }} minutes</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <p class="mb-0">{{ $booking->booking_date->format('M d, Y') }}</p>
                                            <small class="text-muted">{{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-{{ $booking->status_color }}">
                                            {{ ucfirst($booking->status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <p class="mb-0">₹{{ number_format($booking->total_amount, 2) }}</p>
                                            <small class="text-muted">Payment at service</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <a href="{{ route('technician.bookings.show', $booking) }}" class="btn btn-sm btn-primary">
                                                <i class="bi bi-eye"></i>
                                            </a>
                                            @if($booking->status === 'pending')
                                            <form action="{{ route('technician.bookings.update', $booking) }}" method="POST" class="d-inline">
                                                @csrf
                                                @method('PUT')
                                                <input type="hidden" name="status" value="confirmed">
                                                <button type="submit" class="btn btn-sm btn-success">
                                                    <i class="bi bi-check-lg"></i>
                                                </button>
                                            </form>
                                            @endif
                                            @if($booking->status === 'confirmed')
                                            <form action="{{ route('technician.bookings.update', $booking) }}" method="POST" class="d-inline">
                                                @csrf
                                                @method('PUT')
                                                <input type="hidden" name="status" value="completed">
                                                <button type="submit" class="btn btn-sm btn-success">
                                                    <i class="bi bi-check-lg"></i>
                                                </button>
                                            </form>
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <div class="d-flex justify-content-center mt-4">
                        {{ $bookings->links() }}
                    </div>
                    @else
                    <div class="text-center py-5">
                        <div class="mb-3">
                            <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
                        </div>
                        <h5 class="text-muted mb-3">No Bookings Found</h5>
                        <p class="text-muted mb-0">You don't have any bookings at the moment.</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 