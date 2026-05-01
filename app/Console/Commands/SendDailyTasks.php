<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
            ->orderBy('due_time')
            ->get();

        if ($tasks->isEmpty()) {
            $this->info('Нет задач на сегодня.');
            return self::SUCCESS;
        }

        // 2. Формируем единый текст сообщения
        $message = "📅 *Семейные задачи на сегодня (" . $today->format('d.m.Y') . "):*\n\n";
        
        foreach ($tasks as $task) {
            $time = $task->due_time ? " 🕒 " . substr($task->due_time, 0, 5) : "";
            
            $message .= "🔹 *{$task->title}*{$time}\n";
            
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

        foreach ($recipients as $user) {
            $response = Http::withoutVerifying()->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $user->telegram_chat_id,
                'text' => $message,
                'parse_mode' => 'Markdown',
            ]);

            if ($response->successful()) {
                $sentCount++;
            } else {
                Log::error("Ошибка отправки в Telegram для пользователя {$user->id}: " . $response->body());
            }
        }

        $this->info("Общий список отправлен пользователям: {$sentCount}");
        return self::SUCCESS;
    }
}
