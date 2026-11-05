<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $token;

    public function __construct()
    {
        $this->token = (string) (config('services.telegram.bot_token') ?? env('TELEGRAM_BOT_TOKEN') ?? '');
    }

    public function sendMessage(string $chatId, string $message, ?string $parseMode = 'Markdown'): bool
    {
        $payload = [
            'chat_id' => $chatId,
            'text' => $message,
        ];

        if ($parseMode) {
            $payload['parse_mode'] = $parseMode;
        }

        $result = $this->call('sendMessage', $payload);

        return $result['ok'];
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array{ok: bool, status: int, body: string}
     */
    public function call(string $method, array $params = []): array
    {
        if ($this->token === '') {
            Log::error('TELEGRAM_BOT_TOKEN is not set.');

            return ['ok' => false, 'status' => 0, 'body' => 'TELEGRAM_BOT_TOKEN не задан'];
        }

        $request = Http::withoutVerifying()->connectTimeout(15)->timeout(20);
        $proxy = config('services.telegram.proxy');

        if (is_string($proxy) && $proxy !== '') {
            $request = $request->withOptions(['proxy' => $proxy]);
        }

        try {
            $response = $request->post("https://api.telegram.org/bot{$this->token}/{$method}", $params);
        } catch (\Throwable $exception) {
            Log::error('Telegram API error: '.$exception->getMessage());

            return ['ok' => false, 'status' => 0, 'body' => $exception->getMessage()];
        }

        if (! $response->successful()) {
            Log::error('Telegram API error: '.$response->body());
        }

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => $response->body(),
        ];
    }
}
