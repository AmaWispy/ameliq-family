<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CronTestLog extends Command
{
    protected $signature = 'cron:test';

    protected $description = 'Записать в лог время срабатывания (проверка cron / schedule:run)';

    public function handle(): int
    {
        $now = now();

        Log::info('[cron:test] Сработало', [
            'at' => $now->toIso8601String(),
            'timezone' => config('app.timezone'),
        ]);

        $this->info('Записано в лог: '.$now->format('Y-m-d H:i:s T'));

        return self::SUCCESS;
    }
}
