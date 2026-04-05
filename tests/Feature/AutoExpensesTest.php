<?php

namespace Tests\Feature;

use App\Models\AutoExpense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoExpensesTest extends TestCase
{
    use RefreshDatabase;

    public function test_auto_expenses_index_requires_authentication(): void
    {
        $this->get('/auto-expenses')->assertRedirect(route('login', absolute: false));
    }

    public function test_auto_expenses_index_is_accessible_when_authenticated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/auto-expenses')->assertOk();
    }

    public function test_auto_expenses_apply_command_creates_expense_on_matching_day(): void
    {
        $this->travelTo('2026-03-15 08:00:00');

        $user = User::factory()->create();
        $category = ExpenseCategory::query()->create([
            'user_id' => $user->id,
            'name' => 'Подписки',
        ]);

        $auto = AutoExpense::query()->create([
            'user_id' => $user->id,
            'expense_category_id' => $category->id,
            'name' => 'Стриминг',
            'charge_day' => 15,
            'amount' => 99.5,
            'note' => 'план',
            'is_active' => true,
            'last_applied_month' => null,
        ]);

        $this->artisan('auto-expenses:apply')->assertSuccessful();

        $this->assertDatabaseHas('expenses', [
            'user_id' => $user->id,
            'expense_category_id' => $category->id,
            'amount' => '99.50',
        ]);

        $this->assertDatabaseHas('auto_expenses', [
            'id' => $auto->id,
            'last_applied_month' => '2026-03',
        ]);

        $this->artisan('auto-expenses:apply')->assertSuccessful();

        $this->assertEquals(1, \App\Models\Expense::query()->where('user_id', $user->id)->count());
    }

    public function test_auto_expenses_apply_skips_when_day_does_not_match(): void
    {
        $this->travelTo('2026-03-14 08:00:00');

        $user = User::factory()->create();
        $category = ExpenseCategory::query()->create([
            'user_id' => $user->id,
            'name' => 'Прочее',
        ]);

        AutoExpense::query()->create([
            'user_id' => $user->id,
            'expense_category_id' => $category->id,
            'name' => 'Редко',
            'charge_day' => 15,
            'amount' => 10,
            'note' => null,
            'is_active' => true,
            'last_applied_month' => null,
        ]);

        $this->artisan('auto-expenses:apply')->assertSuccessful();

        $this->assertEquals(0, \App\Models\Expense::query()->where('user_id', $user->id)->count());
    }
}
