import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ items, categories }) {
    const destroy = (id) => {
        if (confirm('Удалить этот авторасход?')) {
            router.delete(route('auto-expenses.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Авторасходы</h2>}
        >
            <Head title="Авторасходы" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-lg font-medium">Правила</h3>
                            {categories.length > 0 ? (
                                <Link href={route('auto-expenses.create')}>
                                    <PrimaryButton>Добавить авторасход</PrimaryButton>
                                </Link>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    Сначала создайте{' '}
                                    <Link href={route('expense-categories.index')} className="text-indigo-600">
                                        категорию расхода
                                    </Link>
                                    .
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            {items.length === 0 ? (
                                <p className="text-sm text-gray-600">
                                    {categories.length > 0
                                        ? 'Пока нет правил. Добавьте первое.'
                                        : 'Нужна хотя бы одна категория расходов.'}
                                </p>
                            ) : (
                                items.map((row) => (
                                    <div
                                        key={row.id}
                                        className="flex flex-col gap-3 rounded border p-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900">{row.name}</p>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {row.category_name} · {row.charge_day} число месяца
                                                {row.note ? ` · ${row.note}` : ''}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {row.is_active ? (
                                                    <span className="text-green-700">Активен</span>
                                                ) : (
                                                    <span className="text-gray-500">Выключен</span>
                                                )}
                                                {row.last_applied_month ? ` · последний учёт: ${row.last_applied_month}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                            <p
                                                className="text-2xl font-semibold tabular-nums tracking-tight text-gray-900 sm:text-3xl"
                                                title="Сумма списания"
                                            >
                                                {row.amount.toFixed(2)}
                                            </p>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('auto-expenses.edit', row.id)}
                                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Изменить
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                                                    onClick={() => destroy(row.id)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
