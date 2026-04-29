<?php

namespace App\Services;

use OpenAI;
use App\Models\Books;

class OpenAIService {

    protected $client;

    public function __construct() {
        $this->client = OpenAI::client(env('OPENAI_API_KEY'));
    }

    public function ask($prompt) {
        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            return $response->choices[0]->message->content;
        } catch (\Exception $e) {
            // Log the error or return a friendly message
            Log::error('OpenAI API error: ' . $e->getMessage());
            return 'An error occurred while processing your request.';
        }
    }

    public function searchBooks(string $query, string $mode = 'test'): string {
        // "How many books" question is DB-driven in any case
        if (stripos($query, 'how many books') !== false) {
            $count = Books::count();
            return "There are currently {$count} books available.";
        }

        // In test mode, search DB only
        if ($mode === 'test') {
            $books = Books::where('title', 'LIKE', '%' . $query . '%')
                    ->orWhere('description', 'LIKE', '%' . $query . '%')
                    ->get();

            if ($books->isEmpty()) {
                return "Sorry, no books found matching your search.";
            }

            $reply = "Here are some books I found:\n\n";
            foreach ($books as $book) {
                $reply .= "- " . $book->title . " by " . $book->author . "\n";
            }

            return $reply;
        }

        // In live mode, call ChatGPT
        $response = $this->client->chat()->create([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'user', 'content' => $query],
            ],
        ]);

        return $response->choices[0]->message->content;
    }
}
