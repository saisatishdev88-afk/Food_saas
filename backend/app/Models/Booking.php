<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'technician_id',
        'service_id',
        'booking_date',
        'booking_time',
        'status',
        'total_amount',
        'notes',
        'rating',
        'review'
    ];

    protected $casts = [
        'booking_date' => 'date',
        'booking_time' => 'datetime',
        'total_amount' => 'decimal:2',
        'rating' => 'decimal:1'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(Technician::class);
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'warning',
            'confirmed' => 'primary',
            'completed' => 'success',
            'cancelled' => 'danger',
            default => 'secondary'
        };
    }
} 