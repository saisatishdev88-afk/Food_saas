<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'temp_order_id',
        'menu_item_id',
        'item_name',
        'quantity',
        'price',
        'subtotal'
    ];

    public function tempOrder()
    {
        return $this->belongsTo(TempOrder::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
