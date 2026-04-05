import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Index({ incomes, filters }) {
    const { data: filterData, setData: setFilterData, get } = useForm({
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });

    const incomeEditUrl = (incomeId) => {
        const params = new URLSearchParams();
        if (filterData.start_date) params.set('start_date', filterData.start_date);
        if (filterData.end_date) params.set('end_date', filterData.end_date);
        const qs = params.toString();
        return route('incomes.edit', incomeId) + (qs ? `?${qs}` : '');
    };

    const total = incomes.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Доходы</h2>}
        >
            <Head title="Доходы" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium">Действия</h3>
                        <div className="mb-4">
                            <Link href={route('incomes.create')}>
                                <PrimaryButton>Добавить доход</PrimaryButton>
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                get(route('incomes.index'), {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            className="grid gap-3 md:grid-cols-3"
                        >
                            <div>
                                <InputLabel htmlFor="start_date" value="С" />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    value={filterData.start_date}
                                    onChange={(e) => setFilterData('start_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="end_date" value="По" />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    value={filterData.end_date}
                                    onChange={(e) => setFilterData('end_date', e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <PrimaryButton>Применить</PrimaryButton>
                                <button
                                    type="button"
                                    className="rounded-md border px-3 py-2 text-sm"
                                    onClick={() => router.get(route('incomes.index'))}
                                >
                                    Сброс
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-medium">Список</h3>
                            <p className="text-sm text-gray-600">Итого: {total.toFixed(2)}</p>
                        </div>
                        <div className="space-y-2">
                            {incomes.map((income) => (
                                <div key={income.id} className="flex items-center justify-between rounded border p-3">
                                    <div>
                                        <p className="font-medium">{income.received_on}</p>
                                        <p className="text-sm text-gray-600">
                                            {income.source} {income.note ? `- ${income.note}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold tabular-nums text-gray-900">
                                            {Number(income.amount).toFixed(2)}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link
                                                href={incomeEditUrl(income.id)}
                                                title="Редактировать"
                                                className="rounded-md border p-2 text-sm"
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
                                                className="rounded-md border border-red-300 p-2 text-sm text-red-700"
                                                onClick={() => {
                                                    if (!window.confirm('Удалить доход?')) return;
                                                    router.delete(route('incomes.destroy', income.id));
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
                                </div>
                            ))}
                            {incomes.length === 0 && (
                                <p className="text-sm text-gray-600">Пока нет доходов.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
