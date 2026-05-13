<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestaurantTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'table_number',
        'status',
        'session_token',
        'last_order_id',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function lastOrder()
    {
        return $this->belongsTo(Order::class, 'last_order_id');
    }

    public function isOccupied()
    {
        return $this->status === 'occupied';
    }

    public function lock($sessionToken = null, $orderId = null)
    {
        $this->update([
            'status' => 'occupied',
            'session_token' => $sessionToken,
            'last_order_id' => $orderId,
        ]);
    }

    public function release()
    {
        $this->update([
            'status' => 'available',
            'session_token' => null,
            // We keep last_order_id for history/reference if needed, 
            // or we could clear it. Let's keep it.
        ]);
    }
}
