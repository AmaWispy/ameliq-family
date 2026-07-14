<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $this->resolveType($request->query('type'));
        $search = trim((string) $request->query('search', ''));
        $hasSecureSession = $this->hasSecureSession($request);
        $passwordTabLocked = $type === Note::TYPE_PASSWORD && ! $hasSecureSession;

        if ($passwordTabLocked) {
            $paginated = new LengthAwarePaginator(
                [],
                0,
                25,
                1,
                ['path' => Paginator::resolveCurrentPath(), 'query' => $request->query()]
            );

            return Inertia::render('Notes/Index', [
                'notes' => $paginated,
                'filters' => [
                    'type' => $type,
                    'search' => $search,
                ],
                'hasSecureSession' => false,
                'passwordTabLocked' => true,
            ]);
        }

        $notes = Note::with('user')
            ->where('type', $type)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        if ($search !== '') {
            $notes = $notes->filter(fn (Note $note) => $this->matchesSearch($note, $type, $search));
        }

        $perPage = 25;
        $currentPage = Paginator::resolveCurrentPage();

        $paginated = new LengthAwarePaginator(
            $notes->slice(($currentPage - 1) * $perPage, $perPage)->values()->map(
                fn (Note $note) => $this->serializeNote($note)
            ),
            $notes->count(),
            $perPage,
            $currentPage,
            ['path' => Paginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        return Inertia::render('Notes/Index', [
            'notes' => $paginated,
            'filters' => [
                'type' => $type,
                'search' => $search,
            ],
            'hasSecureSession' => $hasSecureSession,
            'passwordTabLocked' => false,
        ]);
    }

    public function create(Request $request): Response
    {
        $type = $this->resolveType($request->query('type'));

        if ($type === Note::TYPE_PASSWORD && ! $this->hasSecureSession($request)) {
            return redirect()
                ->route('notes.index', ['type' => Note::TYPE_PASSWORD]);
        }

        return Inertia::render('Notes/Create', [
            'type' => $type,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateNote($request);
        $type = $validated['type'];

        if ($type === Note::TYPE_PASSWORD && ! $this->hasSecureSession($request)) {
            return redirect()
                ->route('notes.index', ['type' => Note::TYPE_PASSWORD]);
        }

        $request->user()->notes()->create([
            'type' => $type,
            'title' => $validated['title'],
            'content' => $type === Note::TYPE_NOTE ? $validated['content'] : '',
            'url' => $validated['url'] ?? null,
            'login' => $validated['login'] ?? null,
            'password' => $validated['password'] ?? null,
            'address' => $validated['address'] ?? null,
            'coordinates' => $validated['coordinates'] ?? null,
            'is_favorite' => $validated['is_favorite'] ?? false,
        ]);

        return redirect()->route('notes.index', ['type' => $type]);
    }

    public function edit(Request $request, Note $note): Response
    {
        if ($note->isPasswordType() && ! $this->hasSecureSession($request)) {
            return redirect()->route('notes.index', ['type' => Note::TYPE_PASSWORD]);
        }

        return Inertia::render('Notes/Edit', [
            'note' => $this->serializeNote($note),
        ]);
    }

    public function update(Request $request, Note $note)
    {
        if ($note->isPasswordType() && ! $this->hasSecureSession($request)) {
            return redirect()->route('notes.index', ['type' => Note::TYPE_PASSWORD]);
        }

        $validated = $this->validateNote($request, $note->type);
        $type = $note->type;

        $note->update([
            'title' => $validated['title'],
            'content' => $type === Note::TYPE_NOTE ? $validated['content'] : '',
            'url' => $validated['url'] ?? null,
            'login' => $validated['login'] ?? null,
            'password' => $validated['password'] ?? null,
            'address' => $validated['address'] ?? null,
            'coordinates' => $validated['coordinates'] ?? null,
            'is_favorite' => $validated['is_favorite'] ?? false,
        ]);

        return redirect()->route('notes.index', ['type' => $type]);
    }

    public function destroy(Request $request, Note $note)
    {
        if ($note->isPasswordType() && ! $this->hasSecureSession($request)) {
            return redirect()->route('notes.index', ['type' => Note::TYPE_PASSWORD]);
        }

        $type = $note->type;
        $note->delete();

        return redirect()->route('notes.index', ['type' => $type]);
    }

    public function show(Request $request, Note $note)
    {
        if ($note->isPasswordType() && ! $this->hasSecureSession($request)) {
            return response()->json(['error' => 'Secure session required'], 403);
        }

        return response()->json([
            'password' => $note->password,
            'login' => $note->login,
            'url' => $note->url,
            'content' => $note->isPasswordType() ? $note->password : $note->content,
        ]);
    }

    private function resolveType(?string $type): string
    {
        return in_array($type, Note::TYPES, true) ? $type : Note::TYPE_NOTE;
    }

    private function hasSecureSession(Request $request): bool
    {
        if ($request->session()->get('secure_session') === true) {
            return true;
        }

        // Backward compatibility with older session key.
        $secureUntil = $request->session()->get('secure_session_until');

        return $secureUntil && $secureUntil > now()->timestamp;
    }

    private function matchesSearch(Note $note, string $type, string $search): bool
    {
        $haystacks = match ($type) {
            Note::TYPE_PASSWORD => [$note->title, $note->url, $note->login],
            Note::TYPE_ADDRESS => [$note->title, $note->address],
            default => [$note->title],
        };

        foreach ($haystacks as $value) {
            if ($value !== null && $value !== '' && mb_stripos((string) $value, $search) !== false) {
                return true;
            }
        }

        return false;
    }

    private function validateNote(Request $request, ?string $fixedType = null): array
    {
        $type = $fixedType ?? $this->resolveType($request->input('type'));

        $rules = [
            'type' => [$fixedType ? 'nullable' : 'required', Rule::in(Note::TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'is_favorite' => ['boolean'],
            'url' => ['nullable', 'string', 'max:2048'],
            'login' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'coordinates' => ['nullable', 'string', 'max:255'],
        ];

        if ($type === Note::TYPE_NOTE) {
            $rules['content'] = ['required', 'string'];
        }

        if ($type === Note::TYPE_PASSWORD) {
            $rules['login'] = ['required', 'string', 'max:255'];
            $rules['password'] = ['required', 'string'];
        }

        $validated = $request->validate($rules);
        $validated['type'] = $type;

        return $validated;
    }

    private function serializeNote(Note $note): array
    {
        return [
            'id' => $note->id,
            'type' => $note->type,
            'title' => $note->title,
            'content' => $note->content ?? '',
            'url' => $note->url,
            'login' => $note->login,
            'password' => $note->password,
            'address' => $note->address,
            'coordinates' => $note->coordinates,
            'is_favorite' => $note->is_favorite,
            'updated_at' => $note->updated_at->format('d.m.Y H:i'),
            'user_name' => $note->user?->name,
        ];
    }
}
