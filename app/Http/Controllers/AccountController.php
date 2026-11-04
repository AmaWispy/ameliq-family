<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = $this->accountQuery()
            ->orderByDesc('is_favorite')
            ->orderBy('name')
            ->get()
            ->map(fn (Account $account) => $this->serializeAccount($account));

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Accounts/Create', [
            'categories' => $this->expenseCategories(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateAccount($request);

        $account = $request->user()->accounts()->create([
            'name' => $validated['name'],
            'note' => $validated['note'] ?? null,
            'is_negative' => $validated['is_negative'] ?? false,
            'is_favorite' => $validated['is_favorite'] ?? false,
            'goal_amount' => $validated['goal_amount'] ?? null,
        ]);

        $initial = $validated['initial_amount'] ?? null;
        if ($initial !== null && (float) $initial > 0) {
            $transaction = $account->transactions()->create([
                'user_id' => $request->user()->id,
                'type' => Account::TYPE_DEPOSIT,
                'amount' => $initial,
                'note' => 'Начальный остаток',
                'happened_on' => now()->toDateString(),
                'deducts_balance' => $this->shouldDeductBalance($account, Account::TYPE_DEPOSIT, (bool) ($validated['deduct_from_balance'] ?? false)),
            ]);

            $this->createLinkedExpense($request, $account, $transaction, $validated);
        }

        return redirect()->route('accounts.show', $account);
    }

    public function show(Account $account): Response
    {
        $account->load(['user', 'transactions.user', 'transactions.expense.category']);

        return Inertia::render('Accounts/Show', [
            'account' => $this->serializeAccount($account, withTransactions: true),
            'categories' => $this->expenseCategories(),
        ]);
    }

    public function edit(Account $account): Response
    {
        return Inertia::render('Accounts/Edit', [
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'note' => $account->note,
                'is_negative' => $account->is_negative,
                'is_favorite' => $account->is_favorite,
                'goal_amount' => $account->goal_amount !== null ? (float) $account->goal_amount : '',
            ],
        ]);
    }

    public function update(Request $request, Account $account)
    {
        $validated = $this->validateAccount($request, withInitial: false);

        $account->update([
            'name' => $validated['name'],
            'note' => $validated['note'] ?? null,
            'is_negative' => $validated['is_negative'] ?? false,
            'is_favorite' => $validated['is_favorite'] ?? false,
            'goal_amount' => $validated['goal_amount'] ?? null,
        ]);

        return redirect()->route('accounts.show', $account);
    }

    public function destroy(Account $account)
    {
        $account->delete();

        return redirect()->route('accounts.index');
    }

    public function toggleFavorite(Account $account)
    {
        $account->update([
            'is_favorite' => ! $account->is_favorite,
        ]);

        return back();
    }

    public function storeTransaction(Request $request, Account $account)
    {
        $request->merge([
            'create_expense' => $request->boolean('create_expense'),
            'deduct_from_balance' => $request->boolean('deduct_from_balance'),
            'expense_category_id' => $request->input('expense_category_id') ?: null,
        ]);

        $createsExpense = $request->boolean('create_expense')
            && ! $account->is_negative
            && $request->input('type') === Account::TYPE_DEPOSIT;

        $validated = $request->validate([
            'type' => ['required', Rule::in([Account::TYPE_DEPOSIT, Account::TYPE_WITHDRAWAL])],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:255'],
            'happened_on' => ['required', 'date'],
            'create_expense' => ['boolean'],
            'deduct_from_balance' => ['boolean'],
            'expense_category_id' => [
                Rule::requiredIf($createsExpense),
                'nullable',
                'integer',
                Rule::exists('expense_categories', 'id'),
            ],
        ]);

        $transaction = $request->user()->accountTransactions()->create([
            'account_id' => $account->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'note' => $validated['note'] ?? null,
            'happened_on' => $validated['happened_on'],
            'deducts_balance' => $this->shouldDeductBalance($account, $validated['type'], (bool) $validated['deduct_from_balance']),
        ]);

        $this->createLinkedExpense($request, $account, $transaction, $validated);

        return redirect()->route('accounts.show', $account);
    }

    public function destroyTransaction(Account $account, AccountTransaction $transaction)
    {
        abort_unless($transaction->account_id === $account->id, 404);

        $transaction->delete();

        return redirect()->route('accounts.show', $account);
    }

    private function validateAccount(Request $request, bool $withInitial = true): array
    {
        $request->merge([
            'create_expense' => $request->boolean('create_expense'),
            'deduct_from_balance' => $request->boolean('deduct_from_balance'),
            'expense_category_id' => $request->input('expense_category_id') ?: null,
        ]);

        $rules = [
            'name' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:255'],
            'is_negative' => ['boolean'],
            'is_favorite' => ['boolean'],
            'goal_amount' => ['nullable', 'numeric', 'min:0.01'],
        ];

        if ($withInitial) {
            $rules['initial_amount'] = ['nullable', 'numeric', 'min:0.01'];
            $rules['create_expense'] = ['boolean'];
            $rules['deduct_from_balance'] = ['boolean'];
            $rules['expense_category_id'] = ['nullable', 'integer', Rule::exists('expense_categories', 'id')];
        }

        $validated = $request->validate($rules);
        $validated['goal_amount'] = ($validated['goal_amount'] ?? null) ?: null;
        if (array_key_exists('initial_amount', $validated)) {
            $validated['initial_amount'] = ($validated['initial_amount'] ?? null) ?: null;
        }

        $wantsExpense = $withInitial
            && ($validated['create_expense'] ?? false)
            && ! ($validated['is_negative'] ?? false);

        if ($wantsExpense && empty($validated['initial_amount'])) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'initial_amount' => 'Укажите начальный остаток, чтобы создать расход.',
            ]);
        }

        if ($wantsExpense && empty($validated['expense_category_id'])) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'expense_category_id' => 'Выберите категорию расхода.',
            ]);
        }

        return $validated;
    }

    private function accountQuery()
    {
        return Account::query()
            ->with('user')
            ->withSum(['transactions as deposits_sum' => fn ($query) => $query->where('type', Account::TYPE_DEPOSIT)], 'amount')
            ->withSum(['transactions as withdrawals_sum' => fn ($query) => $query->where('type', Account::TYPE_WITHDRAWAL)], 'amount');
    }

    private function serializeAccount(Account $account, bool $withTransactions = false): array
    {
        $payload = [
            'id' => $account->id,
            'name' => $account->name,
            'note' => $account->note,
            'is_negative' => $account->is_negative,
            'is_favorite' => $account->is_favorite,
            'goal_amount' => $account->goal_amount !== null ? (float) $account->goal_amount : null,
            'balance' => $account->balance(),
            'user_name' => $account->user?->name,
            'updated_at' => $account->updated_at?->format('d.m.Y H:i'),
        ];

        if ($withTransactions) {
            $payload['transactions'] = $account->transactions->map(fn (AccountTransaction $transaction) => [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'amount' => (float) $transaction->amount,
                'note' => $transaction->note,
                'happened_on' => $transaction->happened_on->format('Y-m-d'),
                'happened_on_label' => $transaction->happened_on->format('d.m.Y'),
                'user_name' => $transaction->user?->name,
                'created_at' => $transaction->created_at->format('d.m.Y H:i'),
                'expense' => $transaction->expense ? [
                    'id' => $transaction->expense->id,
                    'category_name' => $transaction->expense->category?->name,
                ] : null,
                'deducts_balance' => $transaction->deducts_balance && ! $transaction->expense,
            ]);
        }

        return $payload;
    }

    private function expenseCategories()
    {
        return ExpenseCategory::query()->orderBy('name')->get(['id', 'name']);
    }

    private function createLinkedExpense(Request $request, Account $account, AccountTransaction $transaction, array $validated): void
    {
        if (
            $account->is_negative
            || $transaction->type !== Account::TYPE_DEPOSIT
            || ! ($validated['create_expense'] ?? false)
            || empty($validated['expense_category_id'])
        ) {
            return;
        }

        $request->user()->expenses()->create([
            'account_transaction_id' => $transaction->id,
            'expense_category_id' => $validated['expense_category_id'],
            'spent_on' => $transaction->happened_on,
            'amount' => $transaction->amount,
            'note' => $transaction->note,
        ]);
    }

    private function shouldDeductBalance(Account $account, string $type, bool $deduct): bool
    {
        return $deduct
            && ! $account->is_negative
            && in_array($type, [Account::TYPE_DEPOSIT, Account::TYPE_WITHDRAWAL], true);
    }
}
