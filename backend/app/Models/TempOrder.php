<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class TempOrder extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'customer_phone',
        'customer_name',
        'order_number',
        'type',
        'fulfillment_type',
        'total_amount',
        'tax_amount',
        'service_charge',
        'status',
        'payment_status',
        'payment_method',
        'payment_type',
        'table_number',
        'notes',
        'razorpay_order_id',
        'payment_response'
    ];

    protected $casts = [
        'payment_response' => 'array'
    ];

    public function items()
    {
        return $this->hasMany(TempOrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
