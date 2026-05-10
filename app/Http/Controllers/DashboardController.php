<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Income;
use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = now();
        $periodStart = $now->day < 10
            ? $now->copy()->subMonth()->startOfMonth()->setDay(10)
            : $now->copy()->startOfMonth()->setDay(10);
        $periodEnd = $periodStart->copy()->addMonth();

        // Calculate initial balance before the first displayed month (6 months ago)
        $firstPeriodStart = $periodStart->copy()->subMonths(5);
        $initialIncome = (float) Income::query()
            ->whereDate('received_on', '<', $firstPeriodStart->toDateString())
            ->sum('amount');
        $initialExpense = (float) Expense::query()
            ->whereDate('spent_on', '<', $firstPeriodStart->toDateString())
            ->sum('amount');
        $currentCumulativeBalance = $initialIncome - $initialExpense;

        $months = [];
        for ($offset = 5; $offset >= 0; $offset--) {
            $start = $periodStart->copy()->subMonths($offset);
            $end = $start->copy()->addMonth();

            $income = (float) Income::query()
                ->whereDate('received_on', '>=', $start->toDateString())
                ->whereDate('received_on', '<', $end->toDateString())
                ->sum('amount');

            $expense = (float) Expense::query()
                ->whereDate('spent_on', '>=', $start->toDateString())
                ->whereDate('spent_on', '<', $end->toDateString())
                ->sum('amount');

            $periodBalance = $income - $expense;
            $currentCumulativeBalance += $periodBalance;

            $months[] = [
                'month' => $start->locale('ru')->translatedFormat('d.m').' - '.$end->locale('ru')->translatedFormat('d.m'),
                'income' => round($income, 2),
                'expense' => round($expense, 2),
                'balance' => round($periodBalance, 2),
                'cumulative_balance' => round($currentCumulativeBalance, 2),
            ];
        }

        $expensesByCategory = Expense::query()
            ->with('category')
            ->whereDate('spent_on', '>=', $periodStart->toDateString())
            ->whereDate('spent_on', '<', $periodEnd->toDateString())
            ->get()
            ->groupBy(fn (Expense $expense) => $expense->category?->name ?? 'Без категории')
            ->map(function ($items, string $name) {
                $firstExpense = $items->first();

                return [
                    'name' => $name,
                    'value' => round((float) $items->sum('amount'), 2),
                    'color' => $firstExpense?->category?->color ?? '#9CA3AF',
                ];
            })
            ->values();

        $taskCalendar = Task::query()
            ->whereNotNull('due_date')
            ->get(['due_date', 'is_completed'])
            ->groupBy(fn (Task $task) => $task->due_date->toDateString())
            ->map(fn ($items) => [
                'total' => $items->count(),
                'open' => $items->where('is_completed', false)->count(),
            ]);

        $totalIncomeAllTime = (float) Income::query()->sum('amount');
        $totalExpenseAllTime = (float) Expense::query()->sum('amount');

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_income' => round((float) Income::query()
                    ->whereDate('received_on', '>=', $periodStart->toDateString())
                    ->whereDate('received_on', '<', $periodEnd->toDateString())
                    ->sum('amount'), 2),
                'total_expense' => round((float) Expense::query()
                    ->whereDate('spent_on', '>=', $periodStart->toDateString())
                    ->whereDate('spent_on', '<', $periodEnd->toDateString())
                    ->sum('amount'), 2),
                'total_balance' => round($totalIncomeAllTime - $totalExpenseAllTime, 2),
                'open_tasks' => Task::query()->where('is_completed', false)->count(),
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
            ],
            'monthly' => $months,
            'expense_by_category' => $expensesByCategory,
            'task_calendar' => $taskCalendar,
            'calendar_month' => $now->format('Y-m'),
        ]);
    }
}
