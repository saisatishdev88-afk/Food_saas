@extends('layouts.admin')

@section('content')
<div class="container-fluid">
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Booking Details</h1>
        <a href="{{ route('admin.bookings.index') }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Back to Bookings
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    <!-- Booking Details Card -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Booking #{{ $booking->id }}</h6>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <h5>Customer Information</h5>
                    <table class="table">
                        <tr>
                            <th>Name:</th>
                            <td>{{ $booking->customer->name }}</td>
                        </tr>
                        <tr>
                            <th>Email:</th>
                            <td>{{ $booking->customer->email }}</td>
                        </tr>
                        <tr>
                            <th>Phone:</th>
                            <td>{{ $booking->customer->mobile }}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Service Information</h5>
                    <table class="table">
                        <tr>
                            <th>Service:</th>
                            <td>{{ $booking->service->name }}</td>
                        </tr>
                        <tr>
                            <th>Date:</th>
                            <td>{{ $booking->booking_date->format('M d, Y') }}</td>
                        </tr>
                        <tr>
                            <th>Time:</th>
                            <td>{{ $booking->booking_time }}</td>
                        </tr>
                        <tr>
                            <th>Amount:</th>
                            <td>${{ number_format($booking->total_amount, 2) }}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-12">
                    <h5>Booking Status</h5>
                    <form action="{{ route('admin.bookings.update-status', $booking) }}" method="POST" class="d-inline">
                        @csrf
                        @method('PUT')
                        <div class="form-group">
                            <select name="status" class="form-control" onchange="this.form.submit()">
                                <option value="pending" {{ $booking->status === 'pending' ? 'selected' : '' }}>Pending</option>
                                <option value="in_progress" {{ $booking->status === 'in_progress' ? 'selected' : '' }}>In Progress</option>
                                <option value="completed" {{ $booking->status === 'completed' ? 'selected' : '' }}>Completed</option>
                                <option value="cancelled" {{ $booking->status === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-12">
                    <h5>Assign Technician</h5>
                    <form action="{{ route('admin.bookings.assign-technician', $booking) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="form-group">
                            <select name="technician_id" class="form-control">
                                <option value="">Select Technician</option>
                                @foreach($technicians as $technician)
                                    <option value="{{ $technician->id }}" {{ $booking->technician_id === $technician->id ? 'selected' : '' }}>
                                        {{ $technician->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Assign Technician</button>
                    </form>
                </div>
            </div>

            @if($booking->notes)
            <div class="row mt-4">
                <div class="col-md-12">
                    <h5>Notes</h5>
                    <div class="card">
                        <div class="card-body">
                            {{ $booking->notes }}
                        </div>
                    </div>
                </div>
            </div>
            @endif
        </div>
    </div>
</div>
@endsection 