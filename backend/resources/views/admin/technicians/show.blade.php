@extends('layouts.admin')

@section('content')
<div class="container-fluid px-4">
    <div class="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Technician Details</h1>
        <div>
            <a href="{{ route('admin.technicians.edit', $technician) }}" class="btn btn-primary me-2">
                <i class="fas fa-edit"></i> Edit
            </a>
            <a href="{{ route('admin.technicians.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Back to List
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-md-8">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-user me-1"></i>
                    Personal Information
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Name:</div>
                        <div class="col-md-8">{{ $technician->name }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Email:</div>
                        <div class="col-md-8">{{ $technician->email }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Mobile:</div>
                        <div class="col-md-8">{{ $technician->mobile }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">City:</div>
                        <div class="col-md-8">{{ $technician->city }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Address:</div>
                        <div class="col-md-8">{{ $technician->address }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Status:</div>
                        <div class="col-md-8">
                            <span class="badge bg-{{ $technician->status === 'approved' ? 'success' : ($technician->status === 'rejected' ? 'danger' : 'warning') }}">
                                {{ ucfirst($technician->status) }}
                            </span>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Registered:</div>
                        <div class="col-md-8">{{ $technician->created_at->format('M d, Y H:i A') }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Document:</div>
                        <div class="col-md-8">
                            @if($technician->document)
                                <a href="{{ Storage::url($technician->document) }}" target="_blank" class="btn btn-info btn-sm">
                                    <i class="fas fa-file-alt"></i> View Document
                                </a>
                            @else
                                <span class="text-muted">No document uploaded</span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-cog me-1"></i>
                    Actions
                </div>
                <div class="card-body">
                    @if($technician->status === 'pending')
                        <form action="{{ route('admin.technicians.approve', $technician) }}" method="POST" class="mb-3">
                            @csrf
                            <button type="submit" class="btn btn-success w-100" 
                                onclick="return confirm('Are you sure you want to approve this technician?')">
                                <i class="fas fa-check"></i> Approve Technician
                            </button>
                        </form>

                        <form action="{{ route('admin.technicians.reject', $technician) }}" method="POST">
                            @csrf
                            <button type="submit" class="btn btn-danger w-100" 
                                onclick="return confirm('Are you sure you want to reject this technician?')">
                                <i class="fas fa-times"></i> Reject Technician
                            </button>
                        </form>
                    @else
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-info-circle"></i>
                            This technician's application has already been {{ $technician->status }}.
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 