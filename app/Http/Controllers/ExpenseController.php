<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function create(Request $request): Response
    {
        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Expenses/Create', [
            'categories' => $categories,
        ]);
    }

    public function edit(Request $request, Expense $expense): Response
    {
        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Expenses/Edit', [
            'expense' => [
                'id' => $expense->id,
                'expense_category_id' => $expense->expense_category_id,
                'spent_on' => $expense->spent_on->format('Y-m-d'),
                'amount' => (float) $expense->amount,
                'note' => $expense->note,
            ],
            'categories' => $categories,
            'return_filters' => [
                'start_date' => $request->string('start_date')->toString(),
                'end_date' => $request->string('end_date')->toString(),
                'category_id' => $request->string('category_id')->toString(),
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
        $categoryId = $request->integer('category_id');

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

        $query = Expense::query()
            ->with('category')
            ->orderByDesc('spent_on')
            ->orderByDesc('id');

        if (! empty($startDate)) {
            $query->whereDate('spent_on', '>=', $startDate);
        }

        if (! empty($endDate)) {
            $query->whereDate('spent_on', '<=', $endDate);
        }

        if ($categoryId > 0) {
            $query->where('expense_category_id', $categoryId);
        }

        $expenses = $query->get()->map(fn (Expense $expense) => [
            'id' => $expense->id,
            'spent_on' => $expense->spent_on->format('Y-m-d'),
            'amount' => (float) $expense->amount,
            'note' => $expense->note,
            'expense_category_id' => $expense->expense_category_id,
            'category_name' => $expense->category?->name,
        ]);

        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'category_id' => $categoryId > 0 ? $categoryId : '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'expense_category_id' => [
                'required',
                'integer',
                Rule::exists('expense_categories', 'id'),
            ],
            'spent_on' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->expenses()->create($validated);

        return redirect()->route('expenses.index');
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'expense_category_id' => [
                'required',
                'integer',
                Rule::exists('expense_categories', 'id'),
            ],
            'spent_on' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $expense->update($validated);

        $query = array_filter([
            'start_date' => $request->input('return_start_date'),
            'end_date' => $request->input('return_end_date'),
            'category_id' => $request->input('return_category_id'),
        ], fn ($value) => $value !== null && $value !== '');

        return redirect()->route('expenses.index', $query);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Expense $expense)
    {
        $expense->delete();

        return redirect()->route('expenses.index');
    }
}
