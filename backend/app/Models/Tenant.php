<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'name',
        'domain',
        'logo',
        'email',
        'phone',
        'status',
        'plan_type',
        'modules',
        'whatsapp_config',
        'subscription_expires_at',
        'subscription_grace_days',
        'is_first_subscription',
    ];

    protected $casts = [
        'modules' => 'array',
        'whatsapp_config' => 'array',
        'subscription_expires_at' => 'datetime',
        'subscription_grace_days' => 'integer',
        'is_first_subscription' => 'boolean',
    ];

    public function isSubscriptionExpired()
    {
        if (!$this->subscription_expires_at) return false;
        
        $expiryWithGrace = $this->subscription_expires_at->copy()->addDays($this->subscription_grace_days ?? 3);
        return now()->greaterThan($expiryWithGrace);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
