<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }} - Technician Login</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Styles -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

        <style>
            body {
                font-family: 'Inter', sans-serif;
                min-height: 100vh;
                display: flex;
                align-items: center;
                background-color: #f8f9fa;
            }
            .split-container {
                min-height: 100vh;
                display: flex;
                align-items: stretch;
            }
            .image-section {
                background-image: url('/img/technician_img.jpg');
                background-size: cover;
                background-position: center;
                position: relative;
                display: none;
            }
            .image-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
            }
            .image-content {
                position: relative;
                z-index: 1;
                color: white;
                padding: 2rem;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .form-section {
                display: flex;
                align-items: center;
                padding: 2rem;
            }
            .form-container {
                width: 100%;
                max-width: 400px;
                margin: 0 auto;
            }
            .form-control {
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                border: 1px solid #dee2e6;
            }
            .form-control:focus {
                border-color: #3498db;
                box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
            }
            .btn-primary {
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                background-color: #3498db;
                border-color: #3498db;
                font-weight: 500;
            }
            .btn-primary:hover {
                background-color: #2980b9;
                border-color: #2980b9;
            }
            .form-check-input:checked {
                background-color: #3498db;
                border-color: #3498db;
            }
            .alert {
                border-radius: 0.5rem;
                border: none;
            }
            @media (min-width: 992px) {
                .image-section {
                    display: block;
                }
            }
        </style>
    </head>
    <body>
        <div class="container-fluid p-0">
            <div class="row g-0 split-container">
                <!-- Image Section -->
                <div class="col-lg-6 image-section">
                    <div class="image-content">
                        <h1 class="display-4 fw-bold mb-4">Welcome Back!</h1>
                        <p class="lead mb-4">Access your technician dashboard to manage your services and bookings.</p>
                        <div class="mt-auto">
                            <p class="mb-0">Don't have an account?</p>
                            <a href="{{ route('technician.register') }}" class="btn btn-outline-light mt-2">
                                Register as Technician
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Form Section -->
                <div class="col-lg-6 form-section">
                    <div class="form-container">
                        <h2 class="text-center mb-4">Technician Login</h2>

                        @if(session('error'))
                        <div class="alert alert-danger">
                            {{ session('error') }}
                        </div>
                        @endif

                        <form method="POST" action="{{ route('technician.login') }}">
                            @csrf

                            <div class="mb-3">
                                <label for="email" class="form-label">Email Address</label>
                                <input id="email" type="email"
                                       class="form-control @error('email') is-invalid @enderror"
                                       name="email" value="{{ old('email') }}"
                                       required autocomplete="email" autofocus>
                                @error('email')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input id="password" type="password"
                                       class="form-control @error('password') is-invalid @enderror"
                                       name="password" required autocomplete="current-password">
                                @error('password')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3 form-check">
                                <input class="form-check-input" type="checkbox" name="remember"
                                       id="remember" {{ old('remember') ? 'checked' : '' }}>
                                <label class="form-check-label" for="remember">
                                    Remember Me
                                </label>
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
</html>