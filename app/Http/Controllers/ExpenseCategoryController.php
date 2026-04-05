<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseCategoryController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('ExpenseCategories/Create');
    }

    public function edit(Request $request, ExpenseCategory $expenseCategory): Response
    {
        return Inertia::render('ExpenseCategories/Edit', [
            'category' => [
                'id' => $expenseCategory->id,
                'name' => $expenseCategory->name,
                'color' => $expenseCategory->color,
            ],
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get()
            ->map(fn (ExpenseCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'expenses_count' => $category->expenses()->count(),
            ]);

        return Inertia::render('ExpenseCategories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('expense_categories', 'name')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $request->user()->expenseCategories()->create([
            ...$validated,
            'color' => $validated['color'] ?? '#6366F1',
        ]);

        return redirect()->route('expense-categories.index');
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('expense_categories', 'name')
                    ->ignore($expenseCategory->id)
                    ->where(fn ($query) => $query->where('user_id', $expenseCategory->user_id)),
            ],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $expenseCategory->update([
            ...$validated,
            'color' => $validated['color'] ?? $expenseCategory->color,
        ]);

        return redirect()->route('expense-categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ExpenseCategory $expenseCategory)
    {
        if ($expenseCategory->expenses()->exists()) {
            return redirect()
                ->route('expense-categories.index')
                ->withErrors(['category' => 'Нельзя удалить категорию, в которой уже есть расходы.']);
        }

        $expenseCategory->delete();

        return redirect()->route('expense-categories.index');
    }
}
