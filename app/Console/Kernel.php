<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('auto-expenses:apply')
            ->dailyAt('6:00')
            ->timezone(config('app.timezone'));

        $schedule->command('tasks:send-daily')
            ->dailyAt('08:00')
            ->timezone(config('app.timezone'));

        //$schedule->command('cron:test')->everyFiveSeconds();
    }

    protected function shouldDiscoverCommands(): bool
    {
        return true;
    }
}
