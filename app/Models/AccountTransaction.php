<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AccountTransaction extends Model
{
    protected $fillable = [
        'account_id',
        'user_id',
        'type',
        'amount',
        'note',
        'happened_on',
        'deducts_balance',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'happened_on' => 'date',
            'deducts_balance' => 'boolean',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expense(): HasOne
    {
        return $this->hasOne(Expense::class);
    }

    public function isDeposit(): bool
    {
        return $this->type === Account::TYPE_DEPOSIT;
    }
}
