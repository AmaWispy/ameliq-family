<?php

use App\Models\Note;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->string('type', 20)->default('note')->after('user_id');
            $table->string('url')->nullable()->after('content');
            $table->string('login')->nullable()->after('url');
            $table->text('password')->nullable()->after('login');
            $table->text('address')->nullable()->after('password');
            $table->string('coordinates')->nullable()->after('address');
        });

        Note::query()->orderBy('id')->each(function (Note $note) {
            if ($note->is_password) {
                $note->forceFill([
                    'type' => 'password',
                    'password' => $note->content,
                    'login' => $note->title !== '' ? $note->title : '—',
                    'content' => '',
                ])->save();
            } else {
                $note->forceFill([
                    'type' => 'note',
                ])->save();
            }
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('is_password');
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->boolean('is_password')->default(false)->after('is_favorite');
        });

        Note::query()->orderBy('id')->each(function (Note $note) {
            if ($note->type === 'password') {
                $note->forceFill([
                    'is_password' => true,
                    'content' => $note->password ?? $note->content,
                ])->save();
            } else {
                $note->forceFill([
                    'is_password' => false,
                ])->save();
            }
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn(['type', 'url', 'login', 'password', 'address', 'coordinates']);
        });
    }
};
