<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome - Service Booking System</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                background-color: #f8f9fa;
            }
            .welcome-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
            }
            .btn-lg {
                padding: 1rem 2rem;
                font-size: 1.1rem;
            }
        </style>
    </head>
    <body>
        <div class="welcome-container">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-8 text-center">
                        <h1 class="display-4 mb-4">Welcome to Service Booking System</h1>
                        <p class="lead mb-5">Please choose your role to continue:</p>

                        <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
                            <!--                            <a href="{{ route('admin.login') }}" class="btn btn-primary btn-lg px-4 gap-3">Admin Login</a>-->
                            <a href="{{ route('customer.login') }}" class="btn btn-success btn-lg px-4 gap-3">Customer Login</a>
                            <a href="{{ route('technician.login') }}" class="btn btn-info btn-lg px-4 gap-3">Technician Login</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
</html>
