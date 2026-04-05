<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->withSchedule(function (Schedule $schedule): void {
        // Каждый день в 06:00 по часовому поясу приложения (config app.timezone / APP_TIMEZONE в .env)
        $schedule->command('auto-expenses:apply')
            ->dailyAt('6:00')
            ->timezone(config('app.timezone'));

        // Проверка cron: при CRON_TEST_LOG=true в .env — раз в минуту пишет время в storage/logs
        $schedule->command('cron:test')
            ->everyMinute()
            ->when(fn () => config('app.cron_test_log'));
    })
    ->create();
