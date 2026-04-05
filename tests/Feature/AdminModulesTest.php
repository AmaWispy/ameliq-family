<?php

namespace Tests\Feature;

use App\Models\ExpenseCategory;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminModulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_users_can_login_and_access_dashboard(): void
    {
        $this->seed();
        $user = User::query()->where('email', 'alexey@ameliq.ru')->firstOrFail();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
    }

    public function test_tasks_page_requires_authentication(): void
    {
        $response = $this->get('/tasks');

        $response->assertRedirect(route('login', absolute: false));
    }

    public function test_authenticated_user_can_create_finance_records(): void
    {
        $user = User::factory()->create();

        $categoryResponse = $this->actingAs($user)->post('/expense-categories', [
            'name' => 'Food',
        ]);
        $categoryResponse->assertRedirect(route('expense-categories.index', absolute: false));
        $category = ExpenseCategory::query()->where('user_id', $user->id)->where('name', 'Food')->firstOrFail();

        $this->actingAs($user)->post('/expenses', [
            'expense_category_id' => $category->id,
            'spent_on' => now()->toDateString(),
            'amount' => 500,
            'note' => 'Groceries',
        ])->assertRedirect(route('expenses.index', absolute: false));

        $this->actingAs($user)->post('/incomes', [
            'received_on' => now()->toDateString(),
            'amount' => 1000,
            'source' => 'Salary',
            'note' => 'Monthly payment',
        ])->assertRedirect(route('incomes.index', absolute: false));

        $this->assertDatabaseHas('expense_categories', ['name' => 'Food', 'user_id' => $user->id]);
        $this->assertDatabaseHas('expenses', ['user_id' => $user->id, 'amount' => 500]);
        $this->assertDatabaseHas('incomes', ['user_id' => $user->id, 'amount' => 1000]);
    }

    public function test_shopping_item_quantity_defaults_to_one_when_empty(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/shopping-lists', [
            'name' => 'Weekly',
        ])->assertRedirect(route('shopping-lists.index', absolute: false));
        $list = ShoppingList::query()->where('user_id', $user->id)->where('name', 'Weekly')->firstOrFail();

        $this->actingAs($user)->post("/shopping-lists/{$list->id}/items", [
            'name' => 'Milk',
            'quantity' => '',
        ])->assertRedirect(route('shopping-lists.show', $list, absolute: false));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Milk',
            'quantity' => 1,
        ]);
    }
}
