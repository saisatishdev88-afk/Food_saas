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
    ];

    protected $casts = [
        'modules' => 'array',
        'whatsapp_config' => 'array',
        'subscription_expires_at' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
