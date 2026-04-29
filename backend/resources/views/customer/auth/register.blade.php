@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
    <div class="row g-0 min-vh-100">
        <!-- Left Side - Registration Form -->
        <div class="col-lg-6 d-flex align-items-center">
            <div class="container px-4 py-5">
                <div class="row justify-content-center">
                    <div class="col-md-8 col-lg-10">
                        <div class="text-center mb-5">
                            <h2 class="fw-bold text-primary">Customer Registration</h2>
                            <p class="text-muted">Create your account to book services</p>
                        </div>

                        <form method="POST" action="{{ route('customer.register') }}" class="needs-validation" novalidate>
                            @csrf

                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                            id="name" name="name" placeholder="John Doe" 
                                            value="{{ old('name') }}" required autocomplete="name" autofocus>
                                        <label for="name">Full Name</label>
                                        @error('name')
                                            <div class="invalid-feedback">
                                                {{ $message }}
                                            </div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                            id="email" name="email" placeholder="name@example.com" 
                                            value="{{ old('email') }}" required autocomplete="email">
                                        <label for="email">Email Address</label>
                                        @error('email')
                                            <div class="invalid-feedback">
                                                {{ $message }}
                                            </div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="tel" class="form-control @error('mobile') is-invalid @enderror" 
                                            id="mobile" name="mobile" placeholder="+1234567890" 
                                            value="{{ old('mobile') }}" required>
                                        <label for="mobile">Mobile Number</label>
                                        @error('mobile')
                                            <div class="invalid-feedback">
                                                {{ $message }}
                                            </div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="text" class="form-control @error('city') is-invalid @enderror" 
                                            id="city" name="city" placeholder="Your City" 
                                            value="{{ old('city') }}" required>
                                        <label for="city">City</label>
                                        @error('city')
                                            <div class="invalid-feedback">
                                                {{ $message }}
                                            </div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="col-12">
                                    <div class="form-floating">
                                        <textarea class="form-control @error('address') is-invalid @enderror" 
                                            id="address" name="address" placeholder="Your address" 
                                            style="height: 100px" required>{{ old('address') }}</textarea>
                                        <label for="address">Full Address</label>
                                        @error('address')
                                            <div class="invalid-feedback">
                                                {{ $message }}
                                            </div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="password" class="form-control @error('password') is-invalid @enderror" 
                                            id="password" name="password" placeholder="Password" required>
                                        <label for="password">Password</label>
                                        @error('password')
                                            <div class="invalid-feedback">
                                                {{ $message }}
                                            </div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="password" class="form-control" 
                                            id="password_confirmation" name="password_confirmation" 
                                            placeholder="Confirm Password" required>
                                        <label for="password_confirmation">Confirm Password</label>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <div class="form-check mb-4">
                                        <input class="form-check-input" type="checkbox" name="terms" id="terms" required>
                                        <label class="form-check-label" for="terms">
                                            I agree to the <a href="#" class="text-decoration-none">Terms and Conditions</a>
                                        </label>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary w-100 py-3 mb-4">
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div class="text-center">
                            <p class="mb-0">Already have an account? 
                                <a href="{{ route('customer.login') }}" class="text-decoration-none fw-bold">
                                    Login here
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Side - Image -->
        <div class="col-lg-6 d-none d-lg-block">
            <div class="bg-image h-100" style="background-image: url('{{ asset('images/customer-register.jpg') }}'); background-size: cover; background-position: center;">
                <div class="overlay h-100 d-flex align-items-center justify-content-center" style="background: rgba(0, 0, 0, 0.5);">
                    <div class="text-center text-white px-5">
                        <h1 class="display-4 fw-bold mb-4">Join Us Today!</h1>
                        <p class="lead">Create an account to book services and manage your appointments easily.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('styles')
<style>
    .form-floating > .form-control:focus ~ label,
    .form-floating > .form-control:not(:placeholder-shown) ~ label {
        color: #0d6efd;
    }
    .form-control:focus {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
</style>
@endpush
@endsection 