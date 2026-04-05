<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Tasks/Create');
    }

    public function edit(Request $request, Task $task): Response
    {
        return Inertia::render('Tasks/Edit', [
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'due_date' => $task->due_date->format('Y-m-d'),
                'due_time' => $task->due_time,
                'is_completed' => $task->is_completed,
            ],
            'return_date' => $request->string('date')->toString(),
        ]);
    }

    public function toggleComplete(Request $request, Task $task)
    {
        $request->validate([
            'is_completed' => ['required', 'boolean'],
        ]);

        $task->update([
            'is_completed' => $request->boolean('is_completed'),
        ]);

        return back();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $dateQuery = $request->query('date');

        if ($dateQuery === null) {
            $dateFilter = now()->toDateString();
        } elseif ($dateQuery === '') {
            $dateFilter = null;
        } else {
            $dateFilter = $dateQuery;
        }

        $tasksQuery = Task::query()
            ->orderByDesc('due_date')
            ->orderByRaw('CASE WHEN due_time IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_time')
            ->orderByDesc('id');

        if ($dateFilter !== null) {
            $tasksQuery->whereDate('due_date', $dateFilter);
        }

        $tasks = $tasksQuery->get()
            ->map(function (Task $task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'due_date' => $task->due_date->format('Y-m-d'),
                    'due_time' => $task->due_time,
                    'is_completed' => $task->is_completed,
                ];
            });

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => [
                'date' => $dateFilter ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['required', 'date'],
            'due_time' => ['nullable', 'string', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'is_completed' => ['nullable', 'boolean'],
        ]);

        $request->user()->tasks()->create($validated);

        return redirect()->route('tasks.index');
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['required', 'date'],
            'due_time' => ['nullable', 'string', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'is_completed' => ['required', 'boolean'],
        ]);

        $task->update($validated);

        $returnDate = $request->string('return_date')->toString();
        if ($returnDate !== '') {
            return redirect()->route('tasks.index', ['date' => $returnDate]);
        }

        return redirect()->route('tasks.index', ['date' => $task->due_date->format('Y-m-d')]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Task $task)
    {
        $task->delete();

        return redirect()->route('tasks.index');
    }
}
