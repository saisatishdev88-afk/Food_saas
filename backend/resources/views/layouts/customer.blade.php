<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }} - Customer Dashboard</title>

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
            background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%);
            color: #fff;
            position: fixed;
            width: 280px;
            transition: all 0.3s;
            box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
        }
        .sidebar .nav-link {
            color: rgba(255, 255, 255, 0.8);
            padding: 0.8rem 1.5rem;
            margin: 0.2rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.3s;
            display: flex;
            align-items: center;
        }
        .sidebar .nav-link:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
        }
        .sidebar .nav-link.active {
            color: #fff;
            background: #3498db;
            box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
        }
        .sidebar .nav-link i {
            margin-right: 0.75rem;
            width: 20px;
            text-align: center;
            font-size: 1.1rem;
        }
        .main-content {
            margin-left: 280px;
            padding: 2rem;
            min-height: 100vh;
        }
        .user-profile {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 1rem;
        }
        .user-profile img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255, 255, 255, 0.2);
        }
        .user-profile h5 {
            margin: 1rem 0 0.25rem;
            font-weight: 600;
        }
        .user-profile p {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.875rem;
            margin: 0;
        }
        .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sidebar-header h4 {
            margin: 0;
            font-weight: 600;
            color: #fff;
        }
        .nav-section {
            padding: 0.5rem 0;
        }
        .nav-section-title {
            padding: 0.5rem 1.5rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.4);
            font-weight: 600;
            letter-spacing: 0.5px;
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
            <div class="sidebar-header">
                <h4>Customer Panel</h4>
            </div>
            
            <div class="user-profile">
                <img src="https://ui-avatars.com/api/?name={{ urlencode(Auth::guard('customer')->user()->name) }}&background=3498db&color=fff" alt="Profile">
                <h5>{{ Auth::guard('customer')->user()->name }}</h5>
                <p>{{ Auth::guard('customer')->user()->email }}</p>
            </div>

            <div class="nav-section">
                <div class="nav-section-title">Main Menu</div>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a href="{{ route('customer.dashboard') }}" class="nav-link {{ request()->routeIs('customer.dashboard') ? 'active' : '' }}">
                            <i class="bi bi-speedometer2"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="{{ route('customer.bookings.index') }}" class="nav-link {{ request()->routeIs('customer.bookings.*') ? 'active' : '' }}">
                            <i class="bi bi-calendar-check"></i> My Bookings
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="{{ route('customer.services.index') }}" class="nav-link {{ request()->routeIs('customer.services.*') ? 'active' : '' }}">
                            <i class="bi bi-gear"></i> Services
                        </a>
                    </li>
                </ul>
            </div>

            <div class="nav-section">
                <div class="nav-section-title">Account</div>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a href="{{ route('customer.profile.edit') }}" class="nav-link {{ request()->routeIs('customer.profile.*') ? 'active' : '' }}">
                            <i class="bi bi-person"></i> Profile
                        </a>
                    </li>
                    <li class="nav-item">
                        <form method="POST" action="{{ route('customer.logout') }}" class="d-inline">
                            @csrf
                            <button type="submit" class="nav-link border-0 bg-transparent w-100 text-start">
                                <i class="bi bi-box-arrow-right"></i> Logout
                            </button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Main content -->
        <main class="main-content">
            @yield('content')
        </main>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
</body>
</html> 