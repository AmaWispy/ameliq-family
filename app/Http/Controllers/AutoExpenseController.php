<?php

namespace App\Http\Controllers;

use App\Models\AutoExpense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AutoExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $items = AutoExpense::query()
            ->with('category')
            ->where('user_id', $request->user()->id)
            ->orderBy('charge_day')
            ->orderBy('name')
            ->get()
            ->map(fn (AutoExpense $row) => [
                'id' => $row->id,
                'name' => $row->name,
                'charge_day' => $row->charge_day,
                'amount' => (float) $row->amount,
                'note' => $row->note,
                'is_active' => $row->is_active,
                'expense_category_id' => $row->expense_category_id,
                'category_name' => $row->category?->name,
                'last_applied_month' => $row->last_applied_month,
            ]);

        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('AutoExpenses/Index', [
            'items' => $items,
            'categories' => $categories,
        ]);
    }

    public function create(Request $request): Response
    {
        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('AutoExpenses/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'expense_category_id' => [
                'required',
                'integer',
                Rule::exists('expense_categories', 'id'),
            ],
            'charge_day' => ['required', 'integer', 'min:1', 'max:31'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['is_active'] = $validated['is_active'] ?? true;

        AutoExpense::query()->create($validated);

        return redirect()->route('auto-expenses.index');
    }

    public function edit(Request $request, AutoExpense $autoExpense): Response
    {
        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('AutoExpenses/Edit', [
            'item' => [
                'id' => $autoExpense->id,
                'name' => $autoExpense->name,
                'expense_category_id' => $autoExpense->expense_category_id,
                'charge_day' => $autoExpense->charge_day,
                'amount' => (float) $autoExpense->amount,
                'note' => $autoExpense->note,
                'is_active' => $autoExpense->is_active,
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, AutoExpense $autoExpense)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'expense_category_id' => [
                'required',
                'integer',
                Rule::exists('expense_categories', 'id'),
            ],
            'charge_day' => ['required', 'integer', 'min:1', 'max:31'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $autoExpense->update($validated);

        return redirect()->route('auto-expenses.index');
    }

    public function destroy(Request $request, AutoExpense $autoExpense)
    {
        $autoExpense->delete();

        return redirect()->route('auto-expenses.index');
    }
}
