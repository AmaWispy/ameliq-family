<?php

namespace App\Http\Controllers;

use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShoppingItemController extends Controller
{
    public function edit(Request $request, ShoppingItem $shoppingItem): Response
    {
        $shoppingItem->load('shoppingList');

        return Inertia::render('ShoppingItems/Edit', [
            'shoppingItem' => [
                'id' => $shoppingItem->id,
                'name' => $shoppingItem->name,
                'quantity' => (float) $shoppingItem->quantity,
                'is_checked' => $shoppingItem->is_checked,
            ],
            'shopping_list_id' => $shoppingItem->shopping_list_id,
        ]);
    }

    public function store(Request $request, ShoppingList $shoppingList)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'quantity' => ['nullable', 'numeric', 'min:0.01'],
        ]);

        $shoppingList->items()->create([
            'name' => $validated['name'],
            // If quantity field is empty, default to 1.
            'quantity' => $validated['quantity'] ?? 1,
        ]);

        return redirect()->route('shopping-lists.show', $shoppingList);
    }

    public function update(Request $request, ShoppingItem $shoppingItem)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'quantity' => ['nullable', 'numeric', 'min:0.01'],
            'is_checked' => ['required', 'boolean'],
        ]);

        $shoppingItem->update([
            'name' => $validated['name'],
            'quantity' => $validated['quantity'] ?? 1,
            'is_checked' => $validated['is_checked'],
        ]);

        return redirect()->route('shopping-lists.show', $shoppingItem->shoppingList);
    }

    public function destroy(Request $request, ShoppingItem $shoppingItem)
    {
        $shoppingList = $shoppingItem->shoppingList;

        $shoppingItem->delete();

        return redirect()->route('shopping-lists.show', $shoppingList);
    }
}
