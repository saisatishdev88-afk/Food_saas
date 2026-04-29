@extends('layouts.admin')

@section('content')
<div class="container-fluid px-4">
    <div class="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Manage Technicians</h1>
        <a href="{{ route('admin.technicians.create') }}" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add New Technician
        </a>
    </div>
    
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <div class="card mb-4">
        <div class="card-header">
            <i class="fas fa-table me-1"></i>
            Technician Applications
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Registered</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($technicians as $technician)
                            <tr>
                                <td>{{ $technician->name }}</td>
                                <td>{{ $technician->email }}</td>
                                <td>{{ $technician->mobile }}</td>
                                <td>{{ $technician->city }}</td>
                                <td>
                                    <span class="badge bg-{{ $technician->status === 'approved' ? 'success' : ($technician->status === 'rejected' ? 'danger' : 'warning') }}">
                                        {{ ucfirst($technician->status) }}
                                    </span>
                                </td>
                                <td>{{ $technician->created_at->format('M d, Y') }}</td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('admin.technicians.show', $technician) }}" 
                                            class="btn btn-sm btn-info">
                                            <i class="fas fa-eye"></i> View
                                        </a>
                                        
                                        @if($technician->status === 'pending')
                                            <form action="{{ route('admin.technicians.approve', $technician) }}" 
                                                method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-sm btn-success" 
                                                    onclick="return confirm('Are you sure you want to approve this technician?')">
                                                    <i class="fas fa-check"></i> Approve
                                                </button>
                                            </form>
                                            
                                            <form action="{{ route('admin.technicians.reject', $technician) }}" 
                                                method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-sm btn-danger" 
                                                    onclick="return confirm('Are you sure you want to reject this technician?')">
                                                    <i class="fas fa-times"></i> Reject
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center">No technicians found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-center mt-4">
                {{ $technicians->links() }}
            </div>
        </div>
    </div>
</div>
@endsection