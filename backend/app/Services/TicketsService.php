<?php

namespace App\Services;

use App\Models\Support_tickets;
use App\Models\Support_chat;
use App\Models\User;
use App\Models\Admin\Admin;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class TicketsService {

    public function createTicket(array $data) {
        // Validate data
        $validator = Validator::make($data, [
                    'user_id' => 'required',
                    'subject' => 'required',
                    'description' => 'required',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return Support_tickets::create([
                    'user_id' => $data['user_id'],
                    'subject' => $data['subject'],
                    'description' => $data['description'],
        ]);
    }

    public function reply_chat(array $data) {
        // Validate data
//        print_r($data);
//        die;
        $validator = Validator::make($data, [
                    'ticket_id' => 'required',
                    'message' => 'required',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return Support_chat::create([
                    'ticket_id' => $data['ticket_id'],
                    'user_id' => !empty($data['user_id']) ? $data['user_id'] : null,
                    'admin_id' => !empty($data['admin_id']) ? $data['admin_id'] : null,
                    'message' => $data['message'],
        ]);
    }

    public function getTicketsByUserId($user_id) {
        return Support_tickets::where('user_id', $user_id)
                        ->orderBy('created_at', 'desc')
                        ->get();
    }

    public function get_ticket_conversation($id) {
        try {
            $ticket = Support_tickets::select('id', 'user_id', 'subject', 'description')->findOrFail($id);

            $chats = Support_chat::where('ticket_id', $id)
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function ($chat) {
                if ($chat->admin_id) {
                    $sender = Admin::find($chat->admin_id);
                    $type = 'admin';
                } else {
                    $sender = User::find($chat->user_id);
                    $type = 'user';
                }

                return [
            'sender_name' => $sender->name ?? 'Unknown',
            'sender_type' => $type,
            'message' => $chat->message,
            'created_time' => $chat->created_at->toDateTimeString(),
                ];
            });

            return [
                'ticket' => $ticket,
                'conversation' => $chats,
            ];
        } catch (\Exception $e) {
            throw $e; // let controller handle the exception
        }
    }
}

?>