<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ShoppingItem extends Model
{
    protected $fillable = [
        'shopping_list_id',
        'name',
        'quantity',
        'is_checked',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'is_checked' => 'boolean',
        ];
    }

    public function shoppingList(): BelongsTo
    {
        return $this->belongsTo(ShoppingList::class);
    }
}
