<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutoExpense extends Model
{
    protected $fillable = [
        'user_id',
        'expense_category_id',
        'name',
        'charge_day',
        'amount',
        'note',
        'is_active',
        'last_applied_month',
    ];

    protected function casts(): array
    {
        return [
            'charge_day' => 'integer',
            'amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }
}
