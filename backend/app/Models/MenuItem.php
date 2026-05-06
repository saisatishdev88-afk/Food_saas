<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class MenuItem extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'name',
        'description',
        'price',
        'discount_price',
        'image_url',
        'is_available',
        'is_veg',
        'prep_time',
        'is_whatsapp_visible'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function ingredients()
    {
        return $this->belongsToMany(InventoryItem::class, 'menu_item_ingredients')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
}
