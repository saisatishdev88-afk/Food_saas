<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    /**
     * Display a listing of the tickets.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Ticket::with(['user:id,name', 'tenant:id,name']);

        // Owners only see their own tenant's tickets
        if (!$user->isSuperAdmin()) {
            $query->where('tenant_id', $user->tenant_id);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Store a newly created ticket.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high',
        ]);

        $ticket = Ticket::create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        return response()->json([
            'message' => 'Ticket created successfully',
            'ticket' => $ticket
        ], 201);
    }

    /**
     * Display the specified ticket with comments.
     */
    public function show(Ticket $ticket)
    {
        $user = Auth::user();

        // Security check
        if (!$user->isSuperAdmin() && $ticket->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket->load(['user:id,name', 'tenant:id,name', 'comments.user:id,name']);

        return response()->json($ticket);
    }

    /**
     * Update the ticket status (SuperAdmin only).
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved',
        ]);

        $ticket->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Ticket status updated',
            'ticket' => $ticket
        ]);
    }

    /**
     * Add a comment to the ticket.
     */
    public function addComment(Request $request, Ticket $ticket)
    {
        $user = Auth::user();

        // Security check
        if (!$user->isSuperAdmin() && $ticket->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $comment = $ticket->comments()->create([
            'user_id' => $user->id,
            'message' => $validated['message'],
        ]);

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment->load('user:id,name')
        ], 201);
    }
}

