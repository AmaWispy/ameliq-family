<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function requestPin(Request $request)
    {
        return response()->json(['message' => 'Введите мастер-пароль.']);
    }

    public function verifyPin(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:4'],
        ]);

        $masterPin = env('SECURITY_PIN', '0000');

        if ($request->pin !== (string) $masterPin) {
            return response()->json(['error' => 'Неверный пароль.'], 422);
        }

        $request->session()->put('secure_session', true);

        return response()->json(['message' => 'Доступ разрешен.']);
    }
}
