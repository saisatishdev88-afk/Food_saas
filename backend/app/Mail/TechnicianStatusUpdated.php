<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TechnicianStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $technician;
    public $status;

    public function __construct($technician, $status)
    {
        $this->technician = $technician;
        $this->status = $status;
    }

    public function build()
    {
        $subject = $this->status === 'approved' 
            ? 'Your Technician Account Has Been Approved' 
            : 'Your Technician Account Application Status';

        return $this->subject($subject)
                    ->markdown('emails.technician-status-updated');
    }
} 