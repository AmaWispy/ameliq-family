<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Task;
use App\Services\TelegramService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendDailyTasks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:send-daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Отправить общий список семейных задач на сегодня всем участникам в Telegram';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $token = config('services.telegram.bot_token') ?? env('TELEGRAM_BOT_TOKEN');

        if (!$token) {
            $this->error('TELEGRAM_BOT_TOKEN не задан в .env');
            return self::FAILURE;
        }

        // 1. Собираем ВСЕ задачи на сегодня (всех пользователей)
        $tasks = Task::with('user')
            ->whereDate('due_date', $today)
            ->where('is_completed', false)
            ->orderByDesc('is_heavy')
            ->orderBy('due_time')
            ->get();

        if ($tasks->isEmpty()) {
            $this->info('Нет задач на сегодня.');
            return self::SUCCESS;
        }

        $hasHeavy = $tasks->contains(fn (Task $task) => $task->is_heavy);

        // 2. Формируем единый текст сообщения
        $message = "📅 *Семейные задачи на сегодня (" . $today->format('d.m.Y') . "):*\n";
        if ($hasHeavy) {
            $message .= "⚡ _Есть тяжёлые задачи_\n";
        }
        $message .= "\n";

        foreach ($tasks as $task) {
            $time = $task->due_time ? " 🕒 " . substr($task->due_time, 0, 5) : "";
            $heavy = $task->is_heavy ? " ⚡" : "";

            $message .= "🔹 *{$task->title}*{$time}{$heavy}\n";

            if ($task->description) {
                $message .= "📝 _{$task->description}_\n";
            }

            $message .= "\n";
        }

        // 3. Получаем список всех, кому нужно отправить (у кого есть chat_id)
        $recipients = User::whereNotNull('telegram_chat_id')->get();

        if ($recipients->isEmpty()) {
            $this->info('Нет пользователей с заполненным telegram_chat_id.');
            return self::SUCCESS;
        }

        $sentCount = 0;
        $telegram = app(TelegramService::class);

        foreach ($recipients as $user) {
            if ($telegram->sendMessage((string) $user->telegram_chat_id, $message)) {
                $sentCount++;
            }
        }

        $this->info("Общий список отправлен пользователям: {$sentCount}");
        return self::SUCCESS;
    }
}
