<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupOrderItem extends Model
{
    protected $fillable = [
        'group_order_id',
        'menu_item_id',
        'item_name',
        'quantity',
        'price',
        'added_by_name',
        'guest_id'
    ];

    public function groupOrder()
    {
        return $this->belongsTo(GroupOrder::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
