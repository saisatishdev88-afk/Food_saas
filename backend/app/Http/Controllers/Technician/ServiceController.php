<?php

namespace App\Http\Controllers\Technician;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller {

    public function index() {
        DB::enableQueryLog();
        $technician = Auth::guard('technician')->user();
        $services = $technician->services()
                ->withCount('bookings')
                ->where('status', '!=', 'completed')
                ->latest()
                ->paginate(10);
//        $queries = DB::getQueryLog();
//        $lastQuery = end($queries);
//        print_r($lastQuery);
//        die;
//        $services = Service::where('status', 1)
//                ->withCount(['bookings', 'technicians'])
//                ->with(['technicians' => function ($query) {
//                        $query->where('is_available', true)
//                        ->where('status', 'approved');
//                    }])
//                ->latest()
//                ->paginate(9);

        return view('technician.services.index', compact('services'));
    }

    public function show(Service $service) {
        // Ensure the service belongs to the authenticated technician
        $technician = Auth::guard('technician')->user();
        if (!$technician->services()->where('services.id', $service->id)->exists()) {
            abort(403);
        }



        return view('technician.services.show', compact('service'));
    }
}
