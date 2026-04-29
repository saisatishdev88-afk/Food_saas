<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }} - Technician Dashboard</title>

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
                background-color: #f8f9fa;
            }
            .sidebar {
                min-height: 100vh;
                background: #2c3e50;
                color: #fff;
                position: fixed;
                width: 250px;
                transition: all 0.3s;
            }
            .sidebar .nav-link {
                color: rgba(255, 255, 255, 0.8);
                padding: 0.8rem 1rem;
                margin: 0.2rem 0;
                border-radius: 0.5rem;
                transition: all 0.3s;
            }
            .sidebar .nav-link:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.1);
            }
            .sidebar .nav-link.active {
                color: #fff;
                background: #3498db;
            }
            .sidebar .nav-link i {
                margin-right: 0.5rem;
                width: 20px;
                text-align: center;
            }
            .main-content {
                margin-left: 250px;
                padding: 2rem;
                min-height: 100vh;
            }
            .topbar {
                background: #fff;
                padding: 1rem;
                border-radius: 0.5rem;
                box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                margin-bottom: 2rem;
            }
            .card {
                border: none;
                box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                border-radius: 0.5rem;
            }
            .card-header {
                background-color: #fff;
                border-bottom: 1px solid rgba(0, 0, 0, 0.125);
                padding: 1rem;
            }
            .table th {
                font-weight: 600;
                background-color: #f8f9fa;
            }
            .btn {
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                font-weight: 500;
            }
            .btn-primary {
                background-color: #3498db;
                border-color: #3498db;
            }
            .btn-primary:hover {
                background-color: #2980b9;
                border-color: #2980b9;
            }
            .profile-img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }
            .dropdown-menu {
                border: none;
                box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                border-radius: 0.5rem;
            }
            .dropdown-item {
                padding: 0.5rem 1rem;
            }
            .dropdown-item:hover {
                background-color: #f8f9fa;
            }
            .badge {
                padding: 0.5em 0.75em;
                font-weight: 500;
            }
        </style>
    </head>

    <body>
        <div class="d-flex">
            <!-- Sidebar -->
            <div class="sidebar">
                <div class="p-3">
                    <h4 class="mb-4">Technician Panel</h4>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a href="{{ route('technician.dashboard') }}" class="nav-link {{ request()->routeIs('technician.dashboard') ? 'active' : '' }}">
                                <i class="bi bi-speedometer2"></i> Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('technician.bookings.index') }}" class="nav-link {{ request()->routeIs('technician.bookings.*') ? 'active' : '' }}">
                                <i class="bi bi-calendar-check"></i> Bookings
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('technician.services.index') }}" class="nav-link {{ request()->routeIs('technician.services.*') ? 'active' : '' }}">
                                <i class="bi bi-gear"></i> Services
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('technician.profile.edit') }}" class="nav-link {{ request()->routeIs('technician.profile.*') ? 'active' : '' }}">
                                <i class="bi bi-person"></i> Profile
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Topbar -->
                <div class="topbar d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">@yield('title', 'Dashboard')</h4>
                    <div class="dropdown">
                        <button class="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="https://ui-avatars.com/api/?name={{ auth()->user()->name }}&background=3498db&color=fff" alt="Profile" class="profile-img me-2">
                            {{ auth()->user()->name }}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li>
                                <a class="dropdown-item" href="{{ route('technician.profile.edit') }}">
                                    <i class="bi bi-person me-2"></i> Profile
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <form method="POST" action="{{ route('technician.logout') }}">
                                    @csrf
                                    <button type="submit" class="dropdown-item text-danger">
                                        <i class="bi bi-box-arrow-right me-2"></i> Logout
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Page Content -->
                @yield('content')
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        @stack('scripts')
    </body>
</html>