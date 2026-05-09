<?php

namespace App\Http\Controllers;

use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecurityController extends Controller
{
    public function requestPin(Request $request)
    {
        // Для статического пароля нам не нужно ничего отправлять, 
        // просто возвращаем успех, чтобы открыть модальное окно на фронте
        return response()->json(['message' => 'Введите мастер-пароль.']);
    }

    public function verifyPin(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:4'],
        ]);

        $masterPin = env('SECURITY_PIN', '0000'); // По умолчанию 0000, если не задано в .env

        if ($request->pin !== (string)$masterPin) {
            return response()->json(['error' => 'Неверный пароль.'], 422);
        }

        // Устанавливаем сессию на 2 часа
        $request->session()->put('secure_session_until', now()->addHours(2)->timestamp);

        return response()->json(['message' => 'Доступ разрешен на 2 часа.']);
    }
}
