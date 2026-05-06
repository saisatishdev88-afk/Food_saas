<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    /**
     * Update WSAPI configuration for the tenant and verify credentials.
     */
    public function updateConfig(Request $request)
    {
        $tenant = Auth::user()->tenant;

        $validated = $request->validate([
            'business_number' => 'required|string',
            'instance_id' => 'required|string',
            'api_key' => 'required|string',
            'subscription_id' => 'nullable|string',
            'welcome_message' => 'required|string',
        ]);

        // Attempt to verify the API Key with WSAPI (but don't block for now to avoid integration friction)
        $isValid = $this->verifyWsapiConnection($validated['api_key'], $validated['instance_id']);

        $validated['status'] = $isValid ? 'connected' : 'partially_configured';

        $tenant->update([
            'whatsapp_config' => $validated
        ]);

        return response()->json([
            'message' => $isValid ? 'WSAPI verified and saved.' : 'Config saved, but verification failed. Please check your credentials.',
            'status' => $isValid ? 'success' : 'warning',
            'config' => $tenant->whatsapp_config
        ]);
    }

    /**
     * Verify WSAPI Connection
     */
    private function verifyWsapiConnection($apiKey, $instanceId)
    {
        // For testing/demo purposes
        if ($apiKey === 'TEST_CONNECT_2026') {
            return true;
        }

        // Real verification logic: Check if instance exists and key is valid
        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'x-instance-id' => $instanceId
            ])->get("https://api.wsapi.chat/instance/details");
            
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WSAPI Verification Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Handle incoming WSAPI Webhooks.
     * Payload structure: { "event": "messages.received", "data": { "message": { "conversation": "..." } } }
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();
        Log::info('WSAPI Webhook Received:', $payload);

        $event = $payload['eventType'] ?? $payload['event'] ?? '';
        
        // WSAPI uses 'message' for incoming messages
        if ($event !== 'message' && $event !== 'messages.received') {
            Log::info("WSAPI Webhook: Ignoring event type: $event");
            return response()->json(['status' => 'ignored_event']);
        }

        $data = $payload['eventData'] ?? $payload['data'] ?? null;
        if (!$data) return response()->json(['status' => 'no_data']);

        // Extract sender and text based on WSAPI Real Payload vs Simulator
        $from = $data['sender']['phone'] ?? null;
        if (!$from) {
            $remoteJid = $data['key']['remoteJid'] ?? $data['chatId'] ?? '';
            $from = explode('@', $remoteJid)[0];
        }
        
        // Extract text from all possible locations
        $text = $data['text'] ?? 
                $data['message']['conversation'] ?? 
                $data['message']['extendedTextMessage']['text'] ?? 
                $data['message']['text'] ?? 
                '';

        $text = strtolower(trim($text));
        if (empty($text)) {
            Log::info("WSAPI Webhook: Text was EMPTY. Raw Data:", (array)$data);
        }
        Log::info("WSAPI Webhook: Extracted Text: '$text' from $from");

        // Find tenant by instance ID provided in the webhook
        $instanceId = $payload['instanceId'] ?? null;
        
        if (!$instanceId) {
            Log::error('WSAPI Webhook: No Instance ID provided in payload.');
            return response()->json(['status' => 'missing_instance_id'], 400);
        }

        // Identify Tenant
        $tenant = \App\Models\Tenant::where('whatsapp_config->instance_id', $instanceId)->first();

        if (!$tenant) {
            Log::error("WSAPI Webhook: No tenant found for Instance ID: $instanceId");
            return response()->json(['status' => 'tenant_not_found'], 404);
        }

        Log::info("WSAPI Webhook: Identified Tenant: {$tenant->name} (ID: {$tenant->id})");

        $config = $tenant->whatsapp_config;

        // Simple Flow Logic
        if ($text === 'hi' || $text === 'hello' || $text === 'start') {
            // Send Logo if available, otherwise welcome text
            if (!empty($tenant->logo)) {
                $welcome = "Welcome to *{$tenant->name}*! 🍴\n\n" . ($config['welcome_message'] ?? "How can we serve you today?");
                $this->sendWhatsAppMessage($from, $welcome . "\n\nReply:\n*1* for Menu\n*2* to Track Order", $tenant);
            } else {
                $this->sendWhatsAppMessage($from, "Welcome to *{$tenant->name}*! 🍴\n\nReply:\n*1* for Menu\n*2* to Track Order", $tenant);
            }
        } elseif ($text === '1' || $text === 'menu') {
            $this->sendMenu($from, $tenant);
        } elseif ($text === '2' || $text === 'track' || str_contains($text, 'status')) {
            $this->trackOrder($from, $tenant);
        } elseif (str_starts_with($text, 'order')) {
            // Support multi-item ordering: "order 14, 7, 8"
            $rawItems = str_replace('order', '', $text);
            preg_match_all('/\d+/', $rawItems, $matches);
            $itemIds = $matches[0] ?? [];
            
            if (empty($itemIds)) {
                $this->sendWhatsAppMessage($from, "❌ Please provide the item IDs. Example: `order 14, 7`", $tenant);
            } else {
                $this->draftOrder($from, $itemIds, $tenant);
            }
        } elseif ($text === 'yes') {
            $itemIds = \Illuminate\Support\Facades\Cache::get("whatsapp_cart_{$from}");
            if ($itemIds) {
                $this->processOrder($from, $itemIds, $tenant);
                \Illuminate\Support\Facades\Cache::forget("whatsapp_cart_{$from}");
            } else {
                $this->sendWhatsAppMessage($from, "You don't have an active order pending confirmation. Send *1* to see the menu.", $tenant);
            }
        }

        return response()->json(['status' => 'processed']);
    }

    /**
     * Send Image with Caption
     */
    private function sendWhatsAppImage($to, $imageUrl, $caption, $tenant)
    {
        $config = $tenant->whatsapp_config;
        $jid = str_contains($to, '@') ? $to : $to . '@s.whatsapp.net';

        try {
            Http::withHeaders([
                'X-API-KEY' => $config['api_key'],
                'X-INSTANCE-ID' => $config['instance_id'],
                'Content-Type' => 'application/json'
            ])->post("https://api.wsapi.chat/messages/image", [
                'to' => $jid,
                'image' => $imageUrl,
                'caption' => $caption
            ]);
        } catch (\Exception $e) {
            Log::error('WSAPI Image Send Failure: ' . $e->getMessage());
        }
    }

    /**
     * Send message via WSAPI
     */
    private function sendWhatsAppMessage($to, $text, $tenant)
    {
        $config = $tenant->whatsapp_config;
        Log::info("WSAPI SEND to $to: $text");

        try {
            // JID suffix is required for WSAPI
            $jid = str_contains($to, '@') ? $to : $to . '@s.whatsapp.net';

            $response = Http::withHeaders([
                'X-API-KEY' => $config['api_key'],
                'X-INSTANCE-ID' => $config['instance_id'],
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post("https://api.wsapi.chat/messages/text", [
                'to' => $jid,
                'text' => $text
            ]);

            if (!$response->successful()) {
                Log::error('WSAPI Send Failure! Status: ' . $response->status());
                Log::error('WSAPI Error Body: ' . $response->body());
            } else {
                Log::info("WSAPI Message Delivered Successfully to $to");
            }
        } catch (\Exception $e) {
            Log::error('WSAPI Connection Crash: ' . $e->getMessage());
        }
    }

    private function sendMenu($to, $tenant)
    {
        $items = \App\Models\MenuItem::withoutGlobalScopes()
            ->where('tenant_id', $tenant->id)
            ->where('is_whatsapp_visible', true)
            ->get();

        if ($items->isEmpty()) {
            $this->sendWhatsAppMessage($to, "Our digital menu is currently being updated. Please try again soon!", $tenant);
            return;
        }

        // Send a "Cover Photo" using the first item's image if it exists
        $firstItemWithImage = $items->first(fn($i) => !empty($i->image_url));
        if ($firstItemWithImage) {
            $this->sendWhatsAppImage($to, $firstItemWithImage->image_url, "Take a look at our *$firstItemWithImage->name*! 🤤", $tenant);
        }

        $menuText = "┏━━━━━━━━━━━━━━━━━━━━┓\n";
        $menuText .= "┃   ✨  *OUR MENU*  ✨   ┃\n";
        $menuText .= "┗━━━━━━━━━━━━━━━━━━━━┛\n\n";

        foreach ($items as $item) {
            $typeIcon = $item->is_veg ? '🟢' : '🔴';
            $foodIcon = $this->getItemIcon($item->name);
            
            $menuText .= "┌────────────────────\n";
            $menuText .= "│ $typeIcon $foodIcon *{$item->name}*\n";
            $menuText .= "│ 💰 *₹{$item->price}*\n";
            $menuText .= "│ 🆔 `order {$item->id}`\n";
            if ($item->description) {
                $menuText .= "│ 📝 _{$item->description}_\n";
            }
            $menuText .= "└────────────────────\n\n";
        }

        $menuText .= "✨ *READY TO EAT?* ✨\n";
        $menuText .= "Reply with: *order [ID]*\n";
        $menuText .= "_Example: order 14_";

        $this->sendWhatsAppMessage($to, $menuText, $tenant);
    }

    /**
     * Get realistic icon based on item name
     */
    private function getItemIcon($name)
    {
        $name = strtolower($name);
        if (str_contains($name, 'burger')) return '🍔';
        if (str_contains($name, 'biryani') || str_contains($name, 'rice') || str_contains($name, 'pulao')) return '🍛';
        if (str_contains($name, 'pizza')) return '🍕';
        if (str_contains($name, 'chicken') || str_contains($name, 'meat')) return '🍗';
        if (str_contains($name, 'puff') || str_contains($name, 'samosa') || str_contains($name, 'snack')) return '🥟';
        if (str_contains($name, 'sweet') || str_contains($name, 'dessert') || str_contains($name, 'rasamalai')) return '🍰';
        if (str_contains($name, 'drink') || str_contains($name, 'juice') || str_contains($name, 'tea') || str_contains($name, 'coffee')) return '🥤';
        
        return '🍽️';
    }

    private function trackOrder($from, $tenant)
    {
        $lastOrder = \App\Models\Order::withoutGlobalScopes()
            ->where('tenant_id', $tenant->id)
            ->where('customer_phone', $from)
            ->latest()
            ->first();

        if (!$lastOrder) {
            $this->sendWhatsAppMessage($from, "🔍 We couldn't find any recent orders for your number. Send *1* to view the menu!", $tenant);
            return;
        }

        $status = ucfirst($lastOrder->status);
        $emoji = match($lastOrder->status) {
            'pending' => '⏳',
            'preparing' => '👨‍🍳',
            'ready' => '✅',
            'delivered' => '🚚',
            'cancelled' => '❌',
            default => '📄'
        };

        $msg = "📦 *ORDER STATUS*\n";
        $msg .= "Order ID: #{$lastOrder->id}\n";
        $msg .= "Status: $emoji *$status*\n";
        $msg .= "Total: *₹{$lastOrder->total_amount}*\n\n";
        
        if ($lastOrder->status === 'pending') {
            $msg .= "Your order is waiting in the queue. ⏳";
        } elseif ($lastOrder->status === 'preparing') {
            $msg .= "Our chefs are cooking your meal right now! 🔥";
        } elseif ($lastOrder->status === 'ready') {
            $msg .= "Your food is ready for pickup! 🎁";
        }

        $this->sendWhatsAppMessage($from, $msg, $tenant);
    }

    private function draftOrder($from, $itemIds, $tenant)
    {
        $itemIds = (array)$itemIds;

        // Check if there's an existing cart to append to
        $existingCart = \Illuminate\Support\Facades\Cache::get("whatsapp_cart_{$from}");
        if ($existingCart) {
            $itemIds = array_merge($existingCart, $itemIds);
        }

        $menuItems = \App\Models\MenuItem::withoutGlobalScopes()
            ->whereIn('id', $itemIds)
            ->where('tenant_id', $tenant->id)
            ->get();
        
        if ($menuItems->isEmpty()) {
            $this->sendWhatsAppMessage($from, "❌ Invalid Item IDs. Please check the menu and try again.", $tenant);
            return;
        }

        $counts = array_count_values($itemIds);
        $total = 0;
        $summary = "📋 *Order Summary:*\n";

        foreach ($counts as $id => $qty) {
            $item = $menuItems->firstWhere('id', $id);
            if ($item) {
                $subtotal = $item->price * $qty;
                $total += $subtotal;
                $summary .= "{$qty} {$item->name} = ₹{$subtotal}\n";
            }
        }
        $summary .= "\n*Total = ₹{$total}*\n\nReply *YES* to confirm";

        \Illuminate\Support\Facades\Cache::put("whatsapp_cart_{$from}", $itemIds, now()->addMinutes(15));
        $this->sendWhatsAppMessage($from, $summary, $tenant);
    }

    private function processOrder($from, $itemIds, $tenant)
    {
        $itemIds = (array)$itemIds;
        Log::info("WSAPI Processing Order for " . implode(',', $itemIds) . " for Tenant {$tenant->id}");

        try {
            $menuItems = \App\Models\MenuItem::withoutGlobalScopes()
                ->whereIn('id', $itemIds)
                ->where('tenant_id', $tenant->id)
                ->get();
            
            if ($menuItems->isEmpty()) {
                $this->sendWhatsAppMessage($from, "❌ Invalid Item IDs. Please check the menu and try again.", $tenant);
                return;
            }

            $counts = array_count_values($itemIds);
            $total = 0;
            $itemsWithQty = [];
            foreach ($counts as $id => $qty) {
                $item = $menuItems->firstWhere('id', $id);
                if ($item) {
                    $itemsWithQty[] = ['item' => $item, 'qty' => $qty];
                    $total += $item->price * $qty;
                }
            }

            // Create the order
            $order = \App\Models\Order::withoutGlobalScopes()->create([
                'tenant_id' => $tenant->id,
                'order_number' => 'WA-' . strtoupper(uniqid()),
                'customer_phone' => $from,
                'total_amount' => $total,
                'status' => 'pending',
                'type' => 'whatsapp',
                'fulfillment_type' => 'takeaway',
                'payment_status' => 'pending'
            ]);

            foreach ($itemsWithQty as $data) {
                $item = $data['item'];
                $qty = $data['qty'];
                \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item->id,
                    'item_name' => $item->name,
                    'quantity' => $qty,
                    'price' => $item->price,
                    'subtotal' => $item->price * $qty
                ]);
            }

            Log::info("WSAPI Order Created: #{$order->id}");
            $this->sendWhatsAppMessage($from, "✅ *ORDER PLACED!*\nYour #{$order->id} is now in the kitchen. Reply *2* at any time to track your status! 👨‍🍳", $tenant);

            // --- ADMIN NOTIFICATION ---
            $adminPhone = $tenant->whatsapp_config['business_number'] ?? null;
            if ($adminPhone && $adminPhone != $from) {
                $adminMsg = "🔔 *NEW ORDER RECEIVED!*\n";
                $adminMsg .= "From: $from\n";
                $adminMsg .= "Order ID: #{$order->id}\n";
                $adminMsg .= "Items: " . $menuItems->pluck('name')->implode(', ') . "\n";
                $adminMsg .= "Total Bill: *₹$total*";
                
                $this->sendWhatsAppMessage($adminPhone, $adminMsg, $tenant);
            }

        } catch (\Exception $e) {
            Log::error("WSAPI Order Crash: " . $e->getMessage());
            $this->sendWhatsAppMessage($from, "⚠️ Sorry, there was an error processing your order.", $tenant);
        }
    }
}
