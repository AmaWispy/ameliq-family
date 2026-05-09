<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class NoteController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $notes = Note::with('user')
            ->orderBy('is_favorite', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        if ($search) {
            $notes = $notes->filter(function ($note) use ($search) {
                return mb_stripos($note->title, $search) !== false;
            });
        }

        $perPage = 25;
        $currentPage = Paginator::resolveCurrentPage();
        
        $paginated = new LengthAwarePaginator(
            $notes->slice(($currentPage - 1) * $perPage, $perPage)->values()->map(function (Note $note) {
                return [
                    'id' => $note->id,
                    'title' => $note->title,
                    'content' => $note->is_password ? '••••••••' : $note->content,
                    'is_favorite' => $note->is_favorite,
                    'is_password' => $note->is_password,
                    'updated_at' => $note->updated_at->format('d.m.Y H:i'),
                    'user_name' => $note->user->name,
                ];
            }),
            $notes->count(),
            $perPage,
            $currentPage,
            ['path' => Paginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        return Inertia::render('Notes/Index', [
            'notes' => $paginated,
            'filters' => [
                'search' => $search ?? '',
            ],
            'hasSecureSession' => $request->session()->has('secure_session_until') && 
                                 $request->session()->get('secure_session_until') > now()->timestamp,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Notes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'is_favorite' => ['boolean'],
            'is_password' => ['boolean'],
        ]);

        $request->user()->notes()->create($validated);

        return redirect()->route('notes.index');
    }

    public function edit(Request $request, Note $note): Response
    {
        if ($note->is_password) {
            $secureUntil = $request->session()->get('secure_session_until');
            if (!$secureUntil || $secureUntil < now()->timestamp) {
                return redirect()->route('notes.index')->with('error', 'Для редактирования пароля требуется подтверждение ПИН-кодом.');
            }
        }

        return Inertia::render('Notes/Edit', [
            'note' => [
                'id' => $note->id,
                'title' => $note->title,
                'content' => $note->content,
                'is_favorite' => $note->is_favorite,
                'is_password' => $note->is_password,
            ],
        ]);
    }

    public function update(Request $request, Note $note)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'is_favorite' => ['boolean'],
            'is_password' => ['boolean'],
        ]);

        $note->update($validated);

        return redirect()->route('notes.index');
    }

    public function destroy(Note $note)
    {
        $note->delete();

        return redirect()->route('notes.index');
    }

    public function show(Request $request, Note $note)
    {
        if ($note->is_password) {
            $secureUntil = $request->session()->get('secure_session_until');
            if (!$secureUntil || $secureUntil < now()->timestamp) {
                return response()->json(['error' => 'Secure session expired'], 403);
            }
        }

        return response()->json([
            'content' => $note->content
        ]);
    }
}
