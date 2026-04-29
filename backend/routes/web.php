<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\TechnicianController;
use App\Http\Controllers\Technician\DashboardController as TechnicianDashboardController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Customer\ServiceController as CustomerServiceController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\Auth\CustomerLoginController;
use App\Http\Controllers\Auth\CustomerRegisterController;
use App\Http\Controllers\Auth\TechnicianLoginController;
use App\Http\Controllers\Auth\TechnicianRegisterController;
use App\Http\Controllers\Technician\ProfileController;
use App\Http\Controllers\Technician\BookingController as TechnicianBookingController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminTechnicianController;
use App\Http\Controllers\Admin\AdminBookingController;

/*
  |--------------------------------------------------------------------------
  | Web Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register web routes for your application. These
  | routes are loaded by the RouteServiceProvider and all of them will
  | be assigned to the "web" middleware group. Make something great!
  |
 */

// Public routes
Route::get('/', function () {
    return view('welcome');
});

// Admin Authentication Routes
Route::prefix('admin')->name('admin.')->group(function () {
    // Guest routes
    Route::middleware('guest:admin')->group(function () {
        Route::get('login', [AdminLoginController::class, 'showLoginForm'])->name('login');
        Route::post('login', [AdminLoginController::class, 'login']);
    });

    // Authenticated routes
    Route::middleware('auth:admin')->group(function () {
        Route::post('logout', [AdminLoginController::class, 'logout'])->name('logout');
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // Profile routes
        Route::get('profile', [AdminProfileController::class, 'show'])->name('profile');
        Route::put('profile', [AdminProfileController::class, 'update'])->name('profile.update');
        
        // Services Management
        Route::resource('services', AdminServiceController::class);
        
        // Technicians Management
        Route::resource('technicians', AdminTechnicianController::class);
        Route::post('technicians/{technician}/approve', [AdminTechnicianController::class, 'approve'])->name('technicians.approve');
        Route::post('technicians/{technician}/reject', [AdminTechnicianController::class, 'reject'])->name('technicians.reject');
        
        // Bookings Management
        Route::resource('bookings', AdminBookingController::class);
    });
});

// Customer Authentication Routes
Route::prefix('customer')->group(function () {
    Route::get('login', [CustomerLoginController::class, 'showLoginForm'])->name('customer.login');
    Route::post('login', [CustomerLoginController::class, 'login']);
    Route::post('logout', [CustomerLoginController::class, 'logout'])->name('customer.logout');
    
    Route::get('register', [CustomerRegisterController::class, 'showRegistrationForm'])->name('customer.register');
    Route::post('register', [CustomerRegisterController::class, 'register']);
});

// Technician Authentication Routes
Route::prefix('technician')->group(function () {
    Route::get('login', [TechnicianLoginController::class, 'showLoginForm'])->name('technician.login');
    Route::post('login', [TechnicianLoginController::class, 'login']);
    Route::post('logout', [TechnicianLoginController::class, 'logout'])->name('technician.logout');
    
    Route::get('register', [TechnicianRegisterController::class, 'showRegistrationForm'])->name('technician.register');
    Route::post('register', [TechnicianRegisterController::class, 'register']);
});

// Protected Admin Routes
Route::middleware(['auth:admin', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Services Management
    Route::resource('services', ServiceController::class);
    
    // Technicians Management
    Route::resource('technicians', TechnicianController::class);
    Route::post('technicians/{technician}/approve', [TechnicianController::class, 'approve'])->name('technicians.approve');
    Route::post('technicians/{technician}/reject', [TechnicianController::class, 'reject'])->name('technicians.reject');

    // Bookings Management
    Route::get('bookings', [App\Http\Controllers\Admin\BookingController::class, 'index'])->name('bookings.index');
    Route::get('bookings/{booking}', [App\Http\Controllers\Admin\BookingController::class, 'show'])->name('bookings.show');
    Route::put('bookings/{booking}/status', [App\Http\Controllers\Admin\BookingController::class, 'updateStatus'])->name('bookings.update-status');
    Route::put('bookings/{booking}/assign-technician', [App\Http\Controllers\Admin\BookingController::class, 'assignTechnician'])->name('bookings.assign-technician');

    // Customer Management
    Route::resource('customers', App\Http\Controllers\Admin\CustomerController::class);
});

// Protected Customer Routes
Route::middleware(['auth:customer', 'customer'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    
    // Bookings Management
    Route::get('bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('bookings/create', [BookingController::class, 'create'])->name('bookings.create');
    Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::get('bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::delete('bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

    // Services Management
    Route::get('services', [CustomerServiceController::class, 'index'])->name('services.index');
    Route::get('services/{service}', [CustomerServiceController::class, 'show'])->name('services.show');

    // Profile Management
    Route::get('profile', [App\Http\Controllers\Customer\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [App\Http\Controllers\Customer\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [App\Http\Controllers\Customer\ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Protected Technician Routes
Route::middleware(['auth:technician', 'technician'])->group(function () {
    Route::get('/dashboard', [TechnicianDashboardController::class, 'index'])->name('technician.dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('technician.profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('technician.profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('technician.profile.destroy');
    
    // Booking routes
    Route::get('/bookings', [TechnicianBookingController::class, 'index'])->name('technician.bookings.index');
    Route::get('/bookings/{booking}', [TechnicianBookingController::class, 'show'])->name('technician.bookings.show');
    Route::put('/bookings/{booking}/status', [TechnicianBookingController::class, 'updateStatus'])->name('technician.bookings.update-status');
    Route::put('/bookings/{booking}', [TechnicianBookingController::class, 'update'])->name('technician.bookings.update');

    // Service routes
    Route::get('/services', [App\Http\Controllers\Technician\ServiceController::class, 'index'])->name('technician.services.index');
    Route::get('/services/{service}', [App\Http\Controllers\Technician\ServiceController::class, 'show'])->name('technician.services.show');
});
