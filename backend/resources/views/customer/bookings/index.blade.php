@extends('layouts.customer')

@section('title', 'My Bookings')

@section('content')
<div class="container-fluid">
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">My Bookings</h5>
            <a href="{{ route('customer.services.index') }}" class="btn btn-primary">
                <i class="bi bi-plus-lg me-2"></i>New Booking
            </a>
        </div>
        <div class="card-body">
            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="bi bi-check-circle me-2"></i>{{ session('success') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            @if($bookings->isEmpty())
                <div class="text-center py-5">
                    <div class="mb-3">
                        <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
                    </div>
                    <h5 class="text-muted mb-3">No Bookings Found</h5>
                    <p class="text-muted mb-4">You haven't made any bookings yet.</p>
                    <a href="{{ route('customer.services.index') }}" class="btn btn-primary">
                        <i class="bi bi-plus-lg me-2"></i>Book a Service
                    </a>
                </div>
            @else
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Technician</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($bookings as $booking)
                            <tr>
                                <td>{{ $booking->service->name }}</td>
                                <td>{{ $booking->booking_date->format('M d, Y') }}</td>
                                <td>{{ $booking->booking_time }}</td>
                                <td>{{ $booking->technician->name }}</td>
                                <td>
                                    <span class="badge bg-{{ $booking->status_color }}">
                                        {{ ucfirst($booking->status) }}
                                    </span>
                                </td>
                                <td>₹{{ number_format($booking->amount, 2) }}</td>
                                <td>
                                    <div class="btn-group">
                                        <a href="{{ route('customer.bookings.show', $booking) }}" 
                                           class="btn btn-sm btn-outline-primary" 
                                           data-bs-toggle="tooltip" 
                                           title="View Details">
                                            <i class="bi bi-eye"></i>
                                        </a>
                                        @if($booking->status === 'pending')
                                        <form action="{{ route('customer.bookings.cancel', $booking) }}" 
                                              method="POST" 
                                              class="d-inline"
                                              onsubmit="return confirm('Are you sure you want to cancel this booking?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" 
                                                    class="btn btn-sm btn-outline-danger"
                                                    data-bs-toggle="tooltip"
                                                    title="Cancel Booking">
                                                <i class="bi bi-x-circle"></i>
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

                <div class="d-flex justify-content-end mt-4">
                    {{ $bookings->links() }}
                </div>
            @endif
        </div>
    </div>
</div>
@endsection 