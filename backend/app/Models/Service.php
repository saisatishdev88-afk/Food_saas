<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

class Service extends Model {

    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_minutes',
        'status'
    ];
    protected $attributes = [
        'duration_minutes' => 60,
        'status' => true
    ];
    protected $casts = [
        'price' => 'decimal:2',
        'duration_minutes' => 'integer',
        'status' => 'boolean'
    ];

    public function bookings(): HasMany {
        return $this->hasMany(Booking::class);
    }

    public function technicians(): BelongsToMany {
        return $this->belongsToMany(Technician::class, 'service_technician')
                        ->withTimestamps();
    }

    public function scopeActive(Builder $query): Builder {
        return $query->where('is_active', true);
    }

    public function getIsActiveAttribute(): bool {
        return $this->attributes['is_active'] ?? true;
    }
}
