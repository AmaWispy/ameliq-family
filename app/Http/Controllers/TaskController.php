<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function create(Request $request): Response
    {
        $defaultDueDate = null;
        $date = $request->query('date');
        if (is_string($date) && $date !== '') {
            $validator = Validator::make(
                ['date' => $date],
                ['date' => ['date']],
            );
            if ($validator->passes()) {
                $defaultDueDate = $date;
            }
        }

        return Inertia::render('Tasks/Create', [
            'defaultDueDate' => $defaultDueDate,
        ]);
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
                'is_heavy' => $task->is_heavy,
                'color' => $task->color,
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
        $startDateQuery = $request->query('date');
        $endDateQuery = $request->query('end_date');

        if ($startDateQuery === null) {
            $startDate = now()->toDateString();
        } elseif ($startDateQuery === '') {
            $startDate = null;
        } else {
            $startDate = $startDateQuery;
        }

        if ($endDateQuery === null && $startDate !== null) {
            $endDate = now()->parse($startDate)->addDays(6)->toDateString();
        } else {
            $endDate = $endDateQuery ?: null;
        }

        $tasksQuery = Task::query()
            ->orderBy('due_date')
            ->orderBy('is_completed')
            ->orderByRaw('CASE WHEN due_time IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_time')
            ->orderBy('id');

        if ($startDate !== null) {
            $tasksQuery->whereDate('due_date', '>=', $startDate);
        }

        if ($endDate !== null) {
            $tasksQuery->whereDate('due_date', '<=', $endDate);
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
                    'is_heavy' => $task->is_heavy,
                    'color' => $task->color,
                ];
            });

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => [
                'date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $request->merge([
            'color' => $request->input('color') ?: null,
        ]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'required_without:due_dates', 'date'],
            'due_dates' => ['nullable', 'array', 'min:1', 'max:366'],
            'due_dates.*' => ['required', 'date'],
            'due_time' => ['nullable', 'string', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'is_completed' => ['nullable', 'boolean'],
            'is_heavy' => ['nullable', 'boolean'],
            'color' => ['nullable', 'string', Rule::in(Task::COLORS)],
        ]);

        $dates = collect($validated['due_dates'] ?? [])
            ->push($validated['due_date'] ?? null)
            ->filter()
            ->unique()
            ->values();

        if ($dates->isEmpty()) {
            return back()->withErrors(['due_date' => 'Укажите хотя бы одну дату.']);
        }

        unset($validated['due_dates'], $validated['due_date']);

        foreach ($dates as $date) {
            $request->user()->tasks()->create([
                ...$validated,
                'due_date' => $date,
            ]);
        }

        return redirect()->route('tasks.index');
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, Task $task)
    {
        $request->merge([
            'color' => $request->input('color') ?: null,
        ]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['required', 'date'],
            'due_time' => ['nullable', 'string', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'is_completed' => ['required', 'boolean'],
            'is_heavy' => ['nullable', 'boolean'],
            'color' => ['nullable', 'string', Rule::in(Task::COLORS)],
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

        return redirect()->route('tasks.index', [
            'date' => $request->input('date', ''),
            'end_date' => $request->input('end_date', ''),
        ]);
    }
}
