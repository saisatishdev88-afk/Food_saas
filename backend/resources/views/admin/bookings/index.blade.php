@extends('layouts.admin')

@section('content')
<div class="container-fluid">
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Bookings Management</h1>
    </div>

    @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    <!-- Bookings Table -->
    <div class="card shadow mb-4">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Technician</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($bookings as $booking)
                            <tr>
                                <td>#{{ $booking->id }}</td>
                                <td>{{ $booking->customer->name }}</td>
                                <td>{{ $booking->service->name }}</td>
                                <td>{{ $booking->booking_date->format('M d, Y') }}</td>
                                <td>
                                    <span class="badge bg-{{ $booking->status === 'pending' ? 'warning' : ($booking->status === 'completed' ? 'success' : 'info') }}">
                                        {{ ucfirst($booking->status) }}
                                    </span>
                                </td>
                                <td>
                                    {{ $booking->technician ? $booking->technician->name : 'Not Assigned' }}
                                </td>
                                <td>${{ number_format($booking->total_amount, 2) }}</td>
                                <td>
                                    <a href="{{ route('admin.bookings.show', $booking) }}" class="btn btn-sm btn-primary">
                                        View Details
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center">No bookings found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="d-flex justify-content-center mt-4">
                {{ $bookings->links() }}
            </div>
        </div>
    </div>
</div>
@endsection 