<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $query = Shift::with('user:id,name,role')->latest();

        if ($request->has('date') && !empty($request->date)) {
            $query->whereDate('clock_in', $request->date);
        }

        return response()->json($query->get());
    }

    public function status()
    {
        $user = auth()->user();
        
        // Find if there is an active shift
        $activeShift = Shift::where('user_id', $user->id)
                            ->whereNull('clock_out')
                            ->first();

        if ($activeShift) {
            // Check if the shift was started on a different day
            // We use the tenant's current date or just system date
            if ($activeShift->clock_in->format('Y-m-d') !== now()->format('Y-m-d')) {
                // Auto-close the stale shift from a previous day
                $activeShift->update([
                    'clock_out' => $activeShift->clock_in->copy()->endOfDay(),
                    'is_incomplete' => true
                ]);
                $activeShift = null;
            }
        }

        return response()->json([
            'is_clocked_in' => $activeShift !== null,
            'shift' => $activeShift
        ]);
    }

    public function toggle()
    {
        try {
            $user = auth()->user();
            
            // First, cleanup any stale shifts from previous days
            Shift::where('user_id', $user->id)
                 ->whereNull('clock_out')
                 ->whereDate('clock_in', '<', now()->format('Y-m-d'))
                 ->update([
                     'clock_out' => \DB::raw('clock_in'), // Close at the same time to signal invalidity
                     'is_incomplete' => true
                 ]);

            $activeShift = Shift::where('user_id', $user->id)
                                ->whereNull('clock_out')
                                ->first();

            if ($activeShift) {
                // Clock out
                $activeShift->update([
                    'clock_out' => now()
                ]);
                return response()->json([
                    'message' => 'Clocked out successfully',
                    'is_clocked_in' => false,
                    'shift' => $activeShift
                ]);
            } else {
                // Clock in
                $shift = Shift::create([
                    'tenant_id' => $user->tenant_id,
                    'user_id' => $user->id,
                    'clock_in' => now()
                ]);
                return response()->json([
                    'message' => 'Clocked in successfully',
                    'is_clocked_in' => true,
                    'shift' => $shift
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Shift Toggle Failed: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Shift operation failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
