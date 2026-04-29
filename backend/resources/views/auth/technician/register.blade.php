<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }} - Technician Registration</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Styles -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
        <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

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
                background-image: url('/img/tools.webp');
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
                max-width: 500px;
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
            .select2-container--default .select2-selection--single {
                height: 45px;
                border: 1px solid #dee2e6;
                border-radius: 0.5rem;
            }
            .select2-container--default .select2-selection--single .select2-selection__rendered {
                line-height: 45px;
                padding-left: 1rem;
            }
            .select2-container--default .select2-selection--single .select2-selection__arrow {
                height: 43px;
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
                        <h1 class="display-4 fw-bold mb-4">Join Our Team!</h1>
                        <p class="lead mb-4">Register as a technician and start providing professional services to our customers.</p>
                        <div class="mt-auto">
                            <p class="mb-0">Already have an account?</p>
                            <a href="{{ route('technician.login') }}" class="btn btn-outline-light mt-2">
                                Login as Technician
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Form Section -->
                <div class="col-lg-6 form-section">
                    <div class="form-container">
                        <h2 class="text-center mb-4">Technician Registration</h2>

                        @if(session('error'))
                        <div class="alert alert-danger">
                            {{ session('error') }}
                        </div>
                        @endif

                        <form method="POST" action="{{ route('technician.register') }}" enctype="multipart/form-data">
                            @csrf

                            <div class="mb-3">
                                <label for="name" class="form-label">Full Name</label>
                                <input id="name" type="text"
                                       class="form-control @error('name') is-invalid @enderror"
                                       name="name" value="{{ old('name') }}"
                                       required autocomplete="name" autofocus>
                                @error('name')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="email" class="form-label">Email Address</label>
                                <input id="email" type="email"
                                       class="form-control @error('email') is-invalid @enderror"
                                       name="email" value="{{ old('email') }}"
                                       required autocomplete="email">
                                @error('email')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="mobile" class="form-label">Mobile Number</label>
                                <input id="mobile" type="tel"
                                       class="form-control @error('mobile') is-invalid @enderror"
                                       name="mobile" value="{{ old('mobile') }}"
                                       required>
                                @error('mobile')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="city" class="form-label">City</label>
                                <input id="city" type="text"
                                       class="form-control @error('city') is-invalid @enderror"
                                       name="city" value="{{ old('city') }}"
                                       required>
                                @error('city')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="address" class="form-label">Address</label>
                                <textarea id="address"
                                          class="form-control @error('address') is-invalid @enderror"
                                          name="address" rows="3" required>{{ old('address') }}</textarea>
                                @error('address')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="document" class="form-label">Document (ID Proof/Certificate)</label>
                                <input type="file" class="form-control @error('document') is-invalid @enderror"
                                       id="document" name="document" accept=".pdf,.jpg,.jpeg,.png" required>
                                <div class="form-text">Upload your ID proof or professional certificate (PDF, JPG, PNG)</div>
                                @error('document')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="services" class="form-label">Services You Can Provide</label>
                                <select id="services"
                                        class="form-control @error('services') is-invalid @enderror"
                                        name="services[]" multiple required>
                                    @foreach($services as $service)
                                    <option value="{{ $service->id }}"
                                            {{ in_array($service->id, old('services', [])) ? 'selected' : '' }}>
                                        {{ $service->name }} - {{ $service->duration }} mins - ${{ $service->price }}
                                    </option>
                                    @endforeach
                                </select>
                                @error('services')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input id="password" type="password"
                                       class="form-control @error('password') is-invalid @enderror"
                                       name="password" required autocomplete="new-password">
                                @error('password')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="password_confirmation" class="form-label">Confirm Password</label>
                                <input id="password_confirmation" type="password"
                                       class="form-control"
                                       name="password_confirmation"
                                       required autocomplete="new-password">
                            </div>

                            <div class="mb-3 form-check">
                                <input class="form-check-input @error('terms') is-invalid @enderror"
                                       type="checkbox" name="terms" id="terms" required>
                                <label class="form-check-label" for="terms">
                                    I agree to the <a href="#">Terms and Conditions</a>
                                </label>
                                @error('terms')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
        <script>
$(document).ready(function () {
    $('#services').select2({
        placeholder: 'Select services you can provide',
        allowClear: true,
        width: '100%'
    });
});
        </script>
    </body>
</html>