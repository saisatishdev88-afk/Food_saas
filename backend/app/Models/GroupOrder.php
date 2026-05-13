<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupOrder extends Model
{
    protected $fillable = [
        'tenant_id',
        'session_token',
        'host_name',
        'table_number',
        'status',
        'total_amount'
    ];

    public function items()
    {
        return $this->hasMany(GroupOrderItem::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
