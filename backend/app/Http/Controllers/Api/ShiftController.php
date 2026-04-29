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
        // Get current user's active shift
        $activeShift = Shift::where('user_id', auth()->id())
                            ->whereNull('clock_out')
                            ->first();

        return response()->json([
            'is_clocked_in' => $activeShift !== null,
            'shift' => $activeShift
        ]);
    }

    public function toggle()
    {
        try {
            $user = auth()->user();
            
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
