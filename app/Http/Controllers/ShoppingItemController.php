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

    public function storeBulk(Request $request, ShoppingList $shoppingList)
    {
        $validated = $request->validate([
            'text' => ['required', 'string', 'max:10000'],
        ]);

        $items = $this->parseShoppingLines($validated['text']);

        if ($items === []) {
            return back()->withErrors([
                'text' => 'Добавьте хотя бы одну строку с продуктом.',
            ]);
        }

        foreach ($items as $item) {
            $shoppingList->items()->create($item);
        }

        return redirect()->route('shopping-lists.show', $shoppingList);
    }

    /**
     * @return list<array{name: string, quantity: float}>
     */
    private function parseShoppingLines(string $text): array
    {
        $items = [];

        foreach (preg_split('/\R/u', $text) as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            if (preg_match('/^(.*)\s+(\d+(?:[.,]\d+)?)$/u', $line, $matches)) {
                $name = trim($matches[1]);
                $quantity = (float) str_replace(',', '.', $matches[2]);

                if ($name !== '' && $quantity > 0) {
                    $items[] = [
                        'name' => mb_substr($name, 0, 120),
                        'quantity' => $quantity,
                    ];

                    continue;
                }
            }

            $items[] = [
                'name' => mb_substr($line, 0, 120),
                'quantity' => 1,
            ];
        }

        return array_slice($items, 0, 200);
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
