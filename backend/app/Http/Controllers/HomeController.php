<?php

namespace App\Http\Controllers;

use App\Models\Home;
use Illuminate\Http\Request;
use App\Services\OpenAIService;

class HomeController extends Controller {

    public function index() {
        //$todos = Home::all();
        return view('home.index');
    }

    public function edit($id) {
        $todo = Home::findOrFail($id);
        return view('home.edit', compact('todo'));
    }

    public function update(Request $request, $id) {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
            'created_at' => 'required|date',
        ]);

        $todo = Home::findOrFail($id);
        $todo->update($request->only('name', 'description', 'created_at'));

        return redirect()->route('home.index')->with('success', 'To-Do updated successfully!');
    }

    public function destroy($id) {
        Home::destroy($id);
        return redirect()->route('home.index')->with('success', 'To-Do deleted successfully!');
    }

    public function chat(Request $request, OpenAIService $openAI) {
        $request->validate([
            'message' => 'required|string',
        ]);

        $message = $request->input('message');
        $mode = $request->input('mode');
        $answer = $openAI->searchBooks($message, $mode); // Use the message from the user input

        return response()->json(['reply' => $answer]);
    }
}

?>
