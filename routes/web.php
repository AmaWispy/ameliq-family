<?php

use App\Http\Controllers\AutoExpenseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ShoppingItemController;
use App\Http\Controllers\ShoppingListController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::patch('/tasks/{task}/completion', [TaskController::class, 'toggleComplete'])->name('tasks.toggle-complete');
    Route::resource('tasks', TaskController::class)->except(['show']);
    Route::resource('expense-categories', ExpenseCategoryController::class)->except(['show']);
    Route::resource('expenses', ExpenseController::class)->except(['show']);
    Route::resource('auto-expenses', AutoExpenseController::class)->except(['show']);
    Route::resource('incomes', IncomeController::class)->except(['show']);
    Route::get('/shopping-items/{shoppingItem}/edit', [ShoppingItemController::class, 'edit'])->name('shopping-items.edit');
    Route::resource('shopping-lists', ShoppingListController::class);
    Route::post('/shopping-lists/{shoppingList}/items', [ShoppingItemController::class, 'store'])->name('shopping-items.store');
    Route::put('/shopping-items/{shoppingItem}', [ShoppingItemController::class, 'update'])->name('shopping-items.update');
    Route::delete('/shopping-items/{shoppingItem}', [ShoppingItemController::class, 'destroy'])->name('shopping-items.destroy');
});

require __DIR__.'/auth.php';
