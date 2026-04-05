<?php

namespace App\Console\Commands;

use App\Models\AutoExpense;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ApplyAutoExpenses extends Command
{
    protected $signature = 'auto-expenses:apply';

    protected $description = 'Создать расходы по активным авторасходам (по числу месяца; вызывается планировщиком ежедневно в 06:00)';

    public function handle(): int
    {
        $today = Carbon::today();
        $monthKey = $today->format('Y-m');
        $lastDayOfMonth = (int) $today->copy()->endOfMonth()->format('d');
        $created = 0;

        AutoExpense::query()
            ->where('is_active', true)
            ->with('user')
            ->orderBy('id')
            ->each(function (AutoExpense $auto) use ($today, $monthKey, $lastDayOfMonth, &$created) {
                if ($auto->last_applied_month === $monthKey) {
                    return;
                }

                $effectiveDay = min($auto->charge_day, $lastDayOfMonth);
                if ((int) $today->format('d') !== $effectiveDay) {
                    return;
                }

                $note = 'Авто: '.$auto->name;
                if ($auto->note) {
                    $note .= '. '.$auto->note;
                }

                $auto->user->expenses()->create([
                    'expense_category_id' => $auto->expense_category_id,
                    'spent_on' => $today->toDateString(),
                    'amount' => $auto->amount,
                    'note' => $note,
                ]);

                $auto->update(['last_applied_month' => $monthKey]);
                $created++;
            });

        if ($created > 0) {
            $this->info("Создано расходов: {$created}.");
        }

        return self::SUCCESS;
    }
}
