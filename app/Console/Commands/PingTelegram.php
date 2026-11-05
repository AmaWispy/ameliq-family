<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Console\Command;

class PingTelegram extends Command
{
    protected $signature = 'telegram:ping {--chat= : Chat ID. Без опции сообщение уйдёт всем, у кого он заполнен}';

    protected $description = 'Проверить доступ к Telegram и отправить короткое сообщение';

    public function handle(TelegramService $telegram): int
    {
        $proxy = config('services.telegram.proxy');
        $this->line(is_string($proxy) && $proxy !== '' ? 'Прокси: включён' : 'Прокси: нет');

        $me = $telegram->call('getMe');

        if (! $me['ok']) {
            $this->error('Бот не ответил: '.$me['body']);

            return self::FAILURE;
        }

        $username = json_decode($me['body'], true)['result']['username'] ?? 'бот';
        $this->info("Бот @{$username} доступен.");

        $chatOption = $this->option('chat');
        $chatIds = is_string($chatOption) && $chatOption !== ''
            ? [$chatOption]
            : User::query()->whereNotNull('telegram_chat_id')->pluck('telegram_chat_id')->unique()->values()->all();

        if ($chatIds === []) {
            $this->warn('Chat ID нет: getMe прошёл, сообщение некому отправить.');

            return self::SUCCESS;
        }

        $text = 'Пинг '.now()->timezone(config('app.timezone'))->format('d.m.Y H:i:s');
        $failed = false;

        foreach ($chatIds as $chatId) {
            $sent = $telegram->sendMessage((string) $chatId, $text, null);

            if ($sent) {
                $this->info("Отправлено в {$chatId}");
            } else {
                $failed = true;
                $this->error("Не отправлено в {$chatId}. Текст ошибки в логе.");
            }
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
