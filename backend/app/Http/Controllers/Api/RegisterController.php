<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\UserService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

//use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller {

    protected $userService;

    public function __construct(UserService $userService) {
        $this->userService = $userService;
    }

    public function register(Request $request) {
        //authentication code
        $username = $request->getUser();
        $password = $request->getPassword();

        $validUsername = 'apiadmin';
        $validPassword = 'apiuser@123';

        if ($username !== $validUsername || $password !== $validPassword) {
            return response()->json([
                        'status' => false,
                        'message' => 'Unauthorized'
                            ], 401)->header('WWW-Authenticate', 'Basic');
        }

        try {

            //to register a new user code
            $user = $this->userService->registerUser($request->all());

            return response()->json([
                        'status' => true,
                        'message' => 'User registered successfully',
                        'data' => ['user_id' => $user['id']]
                            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                        'status' => false,
                        'errors' => $e->errors()
                            ], 422);
        } catch (\Exception $e) {

            return response()->json([
                        'status' => false,
                        'message' => 'Something went wrong',
                        'error' => $e->getMessage()
                            ], 500);
        }
    }
}

?>
