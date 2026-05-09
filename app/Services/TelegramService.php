<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $token;

    public function __construct()
    {
        $this->token = config('services.telegram.bot_token') ?? env('TELEGRAM_BOT_TOKEN');
    }

    public function sendMessage(string $chatId, string $message): bool
    {
        if (!$this->token) {
            Log::error('TELEGRAM_BOT_TOKEN is not set.');
            return false;
        }

        $response = Http::withoutVerifying()->post("https://api.telegram.org/bot{$this->token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'Markdown',
        ]);

        if (!$response->successful()) {
            Log::error("Telegram API error: " . $response->body());
            return false;
        }

        return true;
    }
}
