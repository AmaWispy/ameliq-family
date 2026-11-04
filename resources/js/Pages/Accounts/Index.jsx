import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconStar } from '@tabler/icons-react';

function formatMoney(value) {
    return Number(value).toFixed(2);
}

function goalPercent(account) {
    const goal = Number(account.goal_amount);
    if (!goal) {
        return null;
    }

    return (Number(account.balance) / goal) * 100;
}

function AccountRow({ account }) {
    const percent = goalPercent(account);
    const isDebt = account.is_negative;
    const tone = isDebt ? 'text-red-700' : 'text-gray-900';

    return (
        <div className="flex items-center gap-2 py-2">
            <Link href={route('accounts.show', account.id)} className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                    <p className={`truncate font-medium ${tone}`}>{account.name}</p>
                    <p className={`shrink-0 tabular-nums font-semibold ${tone}`}>
                        {isDebt ? '−' : ''}
                        {formatMoney(Math.abs(account.balance))}
                    </p>
                </div>
                {account.goal_amount || account.note ? (
                    <p className="truncate text-xs text-gray-500">
                        {account.goal_amount
                            ? `цель ${formatMoney(account.goal_amount)}${percent !== null ? ` · ${percent.toFixed(0)}%` : ''}`
                            : account.note}
                    </p>
                ) : null}
            </Link>
            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    title={account.is_favorite ? 'Убрать из избранного' : 'В избранное'}
                    onClick={() => router.patch(route('accounts.toggle-favorite', account.id))}
                    className="rounded-md p-1.5 hover:bg-gray-50"
                >
                    <IconStar
                        size={16}
                        className={account.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}
                    />
                </button>
                <Link
                    href={route('accounts.edit', account.id)}
                    title="Редактировать"
                    className="rounded-md border p-1.5 text-sm"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M13 7l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span className="sr-only">Редактировать</span>
                </Link>
                <button
                    type="button"
                    title="Удалить"
                    className="rounded-md border border-red-300 p-1.5 text-sm text-red-700"
                    onClick={() => {
                        if (!window.confirm('Удалить копилку и всю историю операций?')) return;
                        router.delete(route('accounts.destroy', account.id));
                    }}
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M8 7l1 12h6l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                    <span className="sr-only">Удалить</span>
                </button>
            </div>
        </div>
    );
}

export default function Index({ accounts }) {
    const favorites = accounts.filter((account) => account.is_favorite);
    const rest = accounts.filter((account) => !account.is_favorite);
    const rows = [...favorites, ...rest];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Копилка</h2>}>
            <Head title="Копилка" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-3">
                            <Link href={route('accounts.create')}>
                                <PrimaryButton>Создать копилку</PrimaryButton>
                            </Link>
                        </div>

                        {rows.length === 0 ? (
                            <p className="text-sm text-gray-600">Пока нет копилок.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {rows.map((account) => (
                                    <AccountRow key={account.id} account={account} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
