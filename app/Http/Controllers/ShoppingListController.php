<?php

namespace App\Http\Controllers;

use App\Models\ShoppingList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShoppingListController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('ShoppingLists/Create');
    }

    public function edit(Request $request, ShoppingList $shoppingList): Response
    {
        return Inertia::render('ShoppingLists/Edit', [
            'shoppingList' => [
                'id' => $shoppingList->id,
                'name' => $shoppingList->name,
            ],
            'return_to' => $request->string('return_to')->toString(),
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $lists = ShoppingList::query()
            ->orderByDesc('id')
            ->get()
            ->map(fn (ShoppingList $list) => [
                'id' => $list->id,
                'name' => $list->name,
                'items_count' => $list->items()->count(),
            ]);

        return Inertia::render('ShoppingLists/Index', [
            'shoppingLists' => $lists,
        ]);
    }

    public function show(Request $request, ShoppingList $shoppingList): Response
    {
        $shoppingList->load(['items' => fn ($query) => $query->orderByDesc('id')]);

        return Inertia::render('ShoppingLists/Show', [
            'shoppingList' => [
                'id' => $shoppingList->id,
                'name' => $shoppingList->name,
                'items' => $shoppingList->items->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'quantity' => (float) $item->quantity,
                    'is_checked' => $item->is_checked,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $request->user()->shoppingLists()->create($validated);

        return redirect()->route('shopping-lists.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ShoppingList $shoppingList)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $shoppingList->update($validated);

        if ($request->string('return_to')->toString() === 'show') {
            return redirect()->route('shopping-lists.show', $shoppingList);
        }

        return redirect()->route('shopping-lists.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ShoppingList $shoppingList)
    {
        $shoppingList->delete();

        return redirect()->route('shopping-lists.index');
    }
}
