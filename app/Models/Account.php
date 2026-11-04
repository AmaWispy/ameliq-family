<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    public const TYPE_DEPOSIT = 'deposit';

    public const TYPE_WITHDRAWAL = 'withdrawal';

    protected $fillable = [
        'user_id',
        'name',
        'note',
        'is_negative',
        'is_favorite',
        'goal_amount',
    ];

    protected function casts(): array
    {
        return [
            'is_negative' => 'boolean',
            'is_favorite' => 'boolean',
            'goal_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(AccountTransaction::class)->orderByDesc('happened_on')->orderByDesc('id');
    }

    public function balance(): float
    {
        if ($this->relationLoaded('transactions')) {
            $deposits = (float) $this->transactions->where('type', self::TYPE_DEPOSIT)->sum('amount');
            $withdrawals = (float) $this->transactions->where('type', self::TYPE_WITHDRAWAL)->sum('amount');
        } elseif (array_key_exists('deposits_sum', $this->getAttributes())) {
            $deposits = (float) ($this->deposits_sum ?? 0);
            $withdrawals = (float) ($this->withdrawals_sum ?? 0);
        } else {
            $deposits = (float) $this->transactions()->where('type', self::TYPE_DEPOSIT)->sum('amount');
            $withdrawals = (float) $this->transactions()->where('type', self::TYPE_WITHDRAWAL)->sum('amount');
        }

        return round($deposits - $withdrawals, 2);
    }
}
