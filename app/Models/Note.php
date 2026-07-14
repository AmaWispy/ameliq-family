<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    use HasFactory;

    public const TYPE_NOTE = 'note';

    public const TYPE_PASSWORD = 'password';

    public const TYPE_ADDRESS = 'address';

    public const TYPES = [
        self::TYPE_NOTE,
        self::TYPE_PASSWORD,
        self::TYPE_ADDRESS,
    ];

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'content',
        'url',
        'login',
        'password',
        'address',
        'coordinates',
        'is_favorite',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'encrypted',
            'password' => 'encrypted',
            'is_favorite' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPasswordType(): bool
    {
        return $this->type === self::TYPE_PASSWORD;
    }

    public function isNoteType(): bool
    {
        return $this->type === self::TYPE_NOTE;
    }

    public function isAddressType(): bool
    {
        return $this->type === self::TYPE_ADDRESS;
    }
}
