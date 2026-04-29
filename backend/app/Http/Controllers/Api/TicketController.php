<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\TicketsService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller {

    protected $ticket_service;

    public function __construct(TicketsService $ticket_service) {
        $this->ticket_service = $ticket_service;
    }

    public function create(Request $request) {

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

            //to create a support ticket in software
            $ticket = $this->ticket_service->createTicket($request->all());

            return response()->json([
                        'status' => true,
                        'message' => 'Support ticket created successfully',
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

    public function chat(Request $request) {

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
            $ticket = $this->ticket_service->reply_chat($request->all());

            return response()->json([
                        'status' => true,
                        'message' => 'Message created successfully',
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

    public function get_user_tickets(Request $request) {

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
            $user_id = $request->query('user_id');

            if (!$user_id) {
                return response()->json([
                            'status' => false,
                            'message' => 'user_id is required',
                            'data' => []
                                ], 400);
            }
            DB::enableQueryLog();
            $tickets = $this->ticket_service->getTicketsByUserId($user_id);

//            $queries = DB::getQueryLog();
//            $lastQuery = end($queries);
//            print_r($lastQuery);
//            die;
//            print_r($tickets);
//            die;
            return response()->json([
                        'status' => !empty($tickets) && count($tickets) > 0,
                        'data' => $tickets ?? []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                        'error' => 'Something went wrong',
                        'message' => $e->getMessage(),
                        'data' => []
                            ], 500);
        }
    }

    public function get_ticket_details(Request $request) {

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

            //ticket conversation chat
            $ticket_id = $request->query('ticket_id');

            if (!$ticket_id) {
                return response()->json([
                            'status' => false,
                            'message' => 'ticket_id is required',
                            'data' => []
                                ], 400);
            }
            DB::enableQueryLog();
            $result = $this->ticket_service->get_ticket_conversation($ticket_id);

//            $queries = DB::getQueryLog();
//            $lastQuery = end($queries);
//            print_r($lastQuery);
//            die;
            //print_r($result);die;
            return response()->json([
                        'status' => true,
                        'ticket_details' => $result['ticket'],
                        'conversation' => $result['conversation'] ?? []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                        'status' => false,
                        'message' => 'Something went wrong',
                        'error' => $e->getMessage(),
                        'data' => []
                            ], 500);
        }
    }
}

?>
