@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
    <div class="row g-0 min-vh-100">
        <!-- Left Side - Image -->
        <div class="col-lg-6 d-none d-lg-block">
            <div class="bg-image h-100" style="background-image: url('{{ asset('img/technician_img.jpg') }}'); background-size: cover; background-position: center;">
                <div class="overlay h-100 d-flex align-items-center justify-content-center" style="background: rgba(0, 0, 0, 0.5);">
                    <div class="text-center text-white px-5">
                        <h1 class="display-4 fw-bold mb-4">Welcome Back!</h1>
                        <p class="lead">Manage your services and bookings efficiently.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="col-lg-6 d-flex align-items-center">
            <div class="container px-4 py-5">
                <div class="row justify-content-center">
                    <div class="col-md-8 col-lg-10">
                        @if(session('pending'))
                        <div class="alert alert-warning alert-dismissible fade show" role="alert">
                            <h4 class="alert-heading">Account Pending Approval</h4>
                            <p>Your account is currently pending approval from the administrator. You will be able to login once your account is approved.</p>
                            <hr>
                            <p class="mb-0">Please check your email for updates on your account status.</p>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                        @endif

                        <div class="text-center mb-5">
                            <h2 class="fw-bold text-primary">Technician Login</h2>
                            <p class="text-muted">Sign in to your account</p>
                        </div>

                        <form method="POST" action="{{ route('technician.login') }}" class="needs-validation" novalidate>
                            @csrf

                            <div class="form-floating mb-3">
                                <input type="email" class="form-control @error('email') is-invalid @enderror"
                                       id="email" name="email" placeholder="name@example.com"
                                       value="{{ old('email') }}" required autocomplete="email" autofocus>
                                <label for="email">Email Address</label>
                                @error('email')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="form-floating mb-4">
                                <input type="password" class="form-control @error('password') is-invalid @enderror"
                                       id="password" name="password" placeholder="Password" required>
                                <label for="password">Password</label>
                                @error('password')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="remember"
                                           id="remember" {{ old('remember') ? 'checked' : '' }}>
                                    <label class="form-check-label" for="remember">
                                        Remember Me
                                    </label>
                                </div>
                                @if (Route::has('technician.password.request'))
                                <a href="{{ route('technician.password.request') }}" class="text-decoration-none">
                                    Forgot Password?
                                </a>
                                @endif
                            </div>

                            <button type="submit" class="btn btn-primary w-100 py-3 mb-4">
                                Sign In
                            </button>

                            <div class="text-center">
                                <p class="mb-0">Don't have an account?
                                    <a href="{{ route('technician.register') }}" class="text-decoration-none fw-bold">
                                        Register here
                                    </a>
                                </p>
                            </div>
                        </form>
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