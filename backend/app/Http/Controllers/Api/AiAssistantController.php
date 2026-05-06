<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Order;
use App\Models\MenuItem;

class AiAssistantController extends Controller
{
    public function chat(Request $request)
    {
        \Log::info('AI Chat Request Received', ['message' => $request->message]);
        $validated = $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $tenantId = auth()->user()->tenant_id;
        
        // Gather context
        $startOfDay = \Carbon\Carbon::today()->startOfDay();
        $endOfDay = \Carbon\Carbon::today()->endOfDay();
        
        $todaysRevenue = Order::whereBetween('created_at', [$startOfDay, $endOfDay])
                            ->where('status', '!=', 'cancelled')
                            ->sum('total_amount');
        
        $todaysOrders = Order::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
        
        // Find slow items (items with 0 orders today)
        // Since sqlite might not support complex joins, we'll do it simply
        $orderedItemIds = \App\Models\OrderItem::whereHas('order', function($q) use ($startOfDay, $endOfDay) {
            $q->whereBetween('created_at', [$startOfDay, $endOfDay]);
        })->pluck('menu_item_id')->toArray();

        $slowItems = MenuItem::whereNotIn('id', $orderedItemIds)->pluck('name')->toArray();
        $slowItemsList = implode(", ", array_slice($slowItems, 0, 5)); // Just take 5

        $context = "You are an AI assistant for a restaurant manager on the Foodsoul SaaS platform. Keep your answers brief and professional.\n";
        $context .= "Current Restaurant Context:\n";
        $context .= "- Today's Revenue: Rs {$todaysRevenue}\n";
        $context .= "- Today's Total Orders: {$todaysOrders}\n";
        $context .= "- Some slow-moving items (0 sales today): {$slowItemsList}\n";
        
        $apiKey = env('OPENAI_API_KEY');

        if (!$apiKey || $apiKey === 'your-api-key-here') {
            // Mock response if no key is provided
            return response()->json([
                'message' => "Mock AI Response: Today's revenue is ₹{$todaysRevenue}. Slow items include: {$slowItemsList}. Please add an OPENAI_API_KEY to your .env to enable real AI."
            ]);
        }

        try {
            $response = Http::withToken($apiKey)->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => $context],
                    ['role' => 'user', 'content' => $validated['message']]
                ],
                'temperature' => 0.7,
                'max_tokens' => 150
            ]);

            if ($response->successful()) {
                $result = $response->json();
                return response()->json([
                    'message' => $result['choices'][0]['message']['content']
                ]);
            }

            $errorBody = $response->json();
            $errorMessage = $errorBody['error']['message'] ?? $response->body();
            return response()->json([
                'message' => 'AI Service Error: ' . $errorMessage
            ], 500);

        } catch (\Exception $e) {
            \Log::error('AI Chat Exception: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Failed to connect to OpenAI: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateReport()
    {
        // Mock email report generation
        return response()->json([
            'message' => 'Daily operational report has been generated and queued for email dispatch to the outlet administrator.'
        ]);
    }
}
