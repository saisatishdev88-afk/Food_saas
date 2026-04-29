<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UserService {

    public function registerUser(array $data) {
        // Validate data
        $validator = Validator::make($data, [
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|unique:users,email',
                    'mobile' => 'required|string|unique:users,mobile',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Create user
        return User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'mobile' => $data['mobile'],
        ]);
    }
}

?>