<?php

namespace App\Http\Controllers;

use App\Models\Income;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Incomes/Create');
    }

    public function edit(Request $request, Income $income): Response
    {
        return Inertia::render('Incomes/Edit', [
            'income' => [
                'id' => $income->id,
                'received_on' => $income->received_on->format('Y-m-d'),
                'amount' => (float) $income->amount,
                'source' => $income->source,
                'note' => $income->note,
            ],
            'return_filters' => [
                'start_date' => $request->string('start_date')->toString(),
                'end_date' => $request->string('end_date')->toString(),
            ],
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $startDate = $request->string('start_date')->toString();
        $endDate = $request->string('end_date')->toString();

        // Default period: from the 10th to the 10th next month.
        if ($startDate === '' && $endDate === '') {
            $today = Carbon::today();
            $periodStart = $today->day < 10
                ? $today->copy()->subMonth()->startOfMonth()->setDay(10)
                : $today->copy()->startOfMonth()->setDay(10);
            $periodEnd = $periodStart->copy()->addMonth();

            $startDate = $periodStart->toDateString();
            $endDate = $periodEnd->toDateString();
        }

        $query = Income::query()
            ->orderByDesc('received_on')
            ->orderByDesc('id');

        if (! empty($startDate)) {
            $query->whereDate('received_on', '>=', $startDate);
        }

        if (! empty($endDate)) {
            $query->whereDate('received_on', '<=', $endDate);
        }

        $incomes = $query->get()->map(fn (Income $income) => [
            'id' => $income->id,
            'received_on' => $income->received_on->format('Y-m-d'),
            'amount' => (float) $income->amount,
            'source' => $income->source,
            'note' => $income->note,
        ]);

        return Inertia::render('Incomes/Index', [
            'incomes' => $incomes,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'received_on' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'source' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->incomes()->create($validated);

        return redirect()->route('incomes.index');
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, Income $income)
    {
        $validated = $request->validate([
            'received_on' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'source' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $income->update($validated);

        $query = array_filter([
            'start_date' => $request->input('return_start_date'),
            'end_date' => $request->input('return_end_date'),
        ], fn ($value) => $value !== null && $value !== '');

        return redirect()->route('incomes.index', $query);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Income $income)
    {
        $income->delete();

        return redirect()->route('incomes.index');
    }
}
