<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="description" content="">
        <meta name="author" content="">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }} - Admin Dashboard</title>

        <!-- Font Awesome -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
        <!-- Google Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">

        <style>
            :root {
                --primary: #4e73df;
                --secondary: #858796;
                --success: #1cc88a;
                --info: #36b9cc;
                --warning: #f6c23e;
                --danger: #e74a3b;
                --light: #f8f9fc;
                --dark: #5a5c69;
            }

            body {
                font-family: 'Nunito', sans-serif;
                background-color: #f8f9fc;
            }

            /* Sidebar */
            .sidebar {
                min-height: 100vh;
                background: linear-gradient(180deg, var(--primary) 10%, #224abe 100%);
                position: fixed;
                top: 0;
                left: 0;
                width: 250px;
                z-index: 100;
                transition: all 0.3s;
            }

            .sidebar-brand {
                padding: 1.5rem 1rem;
                text-align: center;
                background: rgba(0, 0, 0, 0.1);
            }

            .sidebar-brand-text {
                color: white;
                font-size: 1.2rem;
                font-weight: 800;
                text-transform: uppercase;
            }

            .sidebar .nav-item {
                margin: 0.25rem 0;
            }

            .sidebar .nav-link {
                color: rgba(255, 255, 255, 0.8);
                padding: 1rem;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                border-radius: 0.35rem;
                margin: 0 0.5rem;
                transition: all 0.2s;
            }

            .sidebar .nav-link:hover {
                color: white;
                background: rgba(255, 255, 255, 0.1);
            }

            .sidebar .nav-link i {
                margin-right: 0.5rem;
                font-size: 1rem;
            }

            .sidebar .nav-item.active .nav-link {
                color: white;
                font-weight: 700;
                background: rgba(255, 255, 255, 0.1);
            }

            /* Content Wrapper */
            #content-wrapper {
                margin-left: 250px;
                min-height: 100vh;
                transition: all 0.3s;
            }

            /* Topbar */
            .topbar {
                background: white;
                box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
                height: 4.375rem;
                position: sticky;
                top: 0;
                z-index: 99;
            }

            .topbar .nav-item .nav-link {
                height: 4.375rem;
                display: flex;
                align-items: center;
                padding: 0 0.75rem;
            }

            .topbar .nav-item .nav-link .img-profile {
                height: 2rem;
                width: 2rem;
                border: 2px solid #e3e6f0;
            }

            /* Cards */
            .card {
                border: none;
                border-radius: 0.35rem;
                box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
                margin-bottom: 1.5rem;
            }

            .card-header {
                background-color: #f8f9fc;
                border-bottom: 1px solid #e3e6f0;
                padding: 1rem 1.25rem;
            }

            .card-header h6 {
                font-size: 1rem;
                font-weight: 700;
                color: #4e73df;
                margin: 0;
            }

            /* Tables */
            .table {
                margin-bottom: 0;
            }

            .table th {
                font-weight: 700;
                color: #5a5c69;
                background-color: #f8f9fc;
                border-bottom: 2px solid #e3e6f0;
            }

            .table td {
                vertical-align: middle;
            }

            /* Buttons */
            .btn {
                font-weight: 600;
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
                border-radius: 0.35rem;
            }

            .btn-primary {
                background-color: var(--primary);
                border-color: var(--primary);
            }

            .btn-primary:hover {
                background-color: #2e59d9;
                border-color: #2653d4;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .sidebar {
                    margin-left: -250px;
                }

                .sidebar.toggled {
                    margin-left: 0;
                }

                #content-wrapper {
                    margin-left: 0;
                }

                #content-wrapper.toggled {
                    margin-left: 250px;
                }
            }

            /* Utilities */
            .sidebar-divider {
                border-top: 1px solid rgba(255, 255, 255, 0.15);
                margin: 1rem 0;
            }

            .sidebar-heading {
                color: rgba(255, 255, 255, 0.4);
                text-transform: uppercase;
                font-weight: 800;
                font-size: 0.65rem;
                padding: 0 1rem;
                margin-top: 1rem;
            }

            .dropdown-menu {
                border: none;
                box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
                border-radius: 0.35rem;
            }

            .dropdown-item {
                padding: 0.5rem 1.5rem;
                font-size: 0.85rem;
            }

            .dropdown-item i {
                margin-right: 0.5rem;
                color: #858796;
            }
        </style>
    </head>

    <body id="page-top">
        <!-- Page Wrapper -->
        <div id="wrapper">
            <!-- Sidebar -->
            <ul class="navbar-nav sidebar">
                <!-- Sidebar - Brand -->
                <a class="sidebar-brand d-flex align-items-center justify-content-center" href="{{ route('admin.dashboard') }}">
                    <div class="sidebar-brand-text">Admin Panel</div>
                </a>

                <!-- Divider -->
                <hr class="sidebar-divider">

                <!-- Nav Item - Dashboard -->
                <li class="nav-item {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                    <a class="nav-link" href="{{ route('admin.dashboard') }}">
                        <i class="fas fa-fw fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </a>
                </li>

                <!-- Divider -->
                <hr class="sidebar-divider">

                <!-- Heading -->
                <div class="sidebar-heading">
                    Management
                </div>
                <!-- Nav Item - Technicians -->
                <li class="nav-item {{ request()->routeIs('admin.customers.*') ? 'active' : '' }}">
                    <a class="nav-link" href="{{ route('admin.customers.index') }}">
                        <i class="fas fa-fw fa-users"></i>
                        <span>Customers</span>
                    </a>
                </li>


                <!-- Nav Item - Technicians -->
                <li class="nav-item {{ request()->routeIs('admin.technicians.*') ? 'active' : '' }}">
                    <a class="nav-link" href="{{ route('admin.technicians.index') }}">
                        <i class="fas fa-fw fa-users"></i>
                        <span>Technicians</span>
                    </a>
                </li>



                <!-- Nav Item - Services -->
                <li class="nav-item {{ request()->routeIs('admin.services.*') ? 'active' : '' }}">
                    <a class="nav-link" href="{{ route('admin.services.index') }}">
                        <i class="fas fa-fw fa-tools"></i>
                        <span>Services</span>
                    </a>
                </li>


                <!-- Nav Item - Bookings -->
                <li class="nav-item {{ request()->routeIs('admin.bookings.*') ? 'active' : '' }}">
                    <a class="nav-link" href="{{ route('admin.bookings.index') }}">
                        <i class="fas fa-fw fa-calendar"></i>
                        <span>Bookings</span>
                    </a>
                </li>
            </ul>
            <!-- End of Sidebar -->

            <!-- Content Wrapper -->
            <div id="content-wrapper">
                <!-- Main Content -->
                <div id="content">
                    <!-- Topbar -->
                    <nav class="navbar navbar-expand navbar-light topbar mb-4">
                        <!-- Sidebar Toggle (Topbar) -->
                        <button id="sidebarToggle" class="btn btn-link d-md-none rounded-circle mr-3">
                            <i class="fa fa-bars"></i>
                        </button>

                        <!-- Topbar Navbar -->
                        <ul class="navbar-nav ml-auto">
                            <div class="topbar-divider d-none d-sm-block"></div>

                            <!-- Nav Item - User Information -->
                            @auth('admin')
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                   data-bs-toggle="dropdown" aria-expanded="false">
                                    <span class="mr-2 d-none d-lg-inline text-gray-600 small">{{ Auth::guard('admin')->user()->name }}</span>
                                    <img class="img-profile rounded-circle" src="https://ui-avatars.com/api/?name={{ urlencode(Auth::guard('admin')->user()->name) }}&background=random">
                                </a>
                                <!-- Dropdown - User Information -->
                                <div class="dropdown-menu dropdown-menu-right shadow" aria-labelledby="userDropdown">
                                    <a class="dropdown-item" href="{{ route('admin.profile') }}">
                                        <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                        Profile
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <form method="POST" action="{{ route('admin.logout') }}">
                                        @csrf
                                        <button type="submit" class="dropdown-item">
                                            <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                            Logout
                                        </button>
                                    </form>
                                </div>
                            </li>
                            @endauth
                        </ul>
                    </nav>
                    <!-- End of Topbar -->

                    <!-- Begin Page Content -->
                    <div class="container-fluid">
                        @yield('content')
                    </div>
                    <!-- End of Page Content -->
                </div>
                <!-- End of Main Content -->

                <!-- Footer -->
                <footer class="sticky-footer bg-white">
                    <div class="container my-auto">
                        <div class="copyright text-center my-auto">
<!--                            <span>Copyright &copy; {{ config('app.name') }} {{ date('Y') }}</span>-->
                        </div>
                    </div>
                </footer>
                <!-- End of Footer -->
            </div>
            <!-- End of Content Wrapper -->
        </div>
        <!-- End of Page Wrapper -->

        <!-- Scripts -->
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>

        <script>
$(document).ready(function () {
    // Toggle sidebar
    $("#sidebarToggle").on('click', function (e) {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        $("#content-wrapper").toggleClass("toggled");
    });

    // Close any open menu accordions when window is resized below 768px
    $(window).resize(function () {
        if ($(window).width() < 768) {
            $('.sidebar').addClass('toggled');
            $('#content-wrapper').addClass('toggled');
        }
    });

    // Initialize dropdowns
    $('.dropdown-toggle').dropdown();
});
        </script>

        @stack('scripts')
    </body>
</html>