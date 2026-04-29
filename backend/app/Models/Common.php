<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;

class Common extends Model {

    public static function sendMessage($message, $mobile_number, $template_id = null) {
        $url = "http://login.smsmoon.com/API/sms.php";
        $message = urlencode($message);

        $username = "ogosolutions";
        $password = "vizag@123";
        $senderid = "OGOBIK";

        // Prepare the data for the request
        $send_arr = [
            "username" => $username,
            "password" => $password,
            "from" => $senderid,
            "to" => $mobile_number,
            "msg" => $message,
            "type" => 1,
            "dnd_check" => 0,
            "template_id" => $template_id,
        ];

        // Make the API request using Laravel's Http facade
        $response = Http::asForm()->post($url, $send_arr);

        // Return the response or handle it as needed
        return $response->body();
    }
}

?>