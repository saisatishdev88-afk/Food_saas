@component('mail::message')
# Hello {{ $technician->name }},

@if($status === 'approved')
Your technician account has been approved! You can now login to your account and start offering your services.

@component('mail::button', ['url' => route('technician.login')])
Login to Your Account
@endcomponent

@else
We regret to inform you that your technician account application has been rejected. If you believe this is an error, please contact our support team.

@component('mail::button', ['url' => route('contact')])
Contact Support
@endcomponent
@endif

Thanks,<br>
{{ config('app.name') }}
@endcomponent 