import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const CATEGORY_BAR_MARGIN = { top: 8, right: 64, left: 8, bottom: 8 };

export default function Index({ expenses, categories, filters, expense_by_category: expenseByCategory = [] }) {
    const { data: filterData, setData: setFilterData, get } = useForm({
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
        category_id: filters.category_id ?? '',
    });

    const expenseEditUrl = (expenseId) => {
        const params = new URLSearchParams();
        if (filterData.start_date) params.set('start_date', filterData.start_date);
        if (filterData.end_date) params.set('end_date', filterData.end_date);
        if (filterData.category_id) params.set('category_id', filterData.category_id);
        const qs = params.toString();
        return route('expenses.edit', expenseId) + (qs ? `?${qs}` : '');
    };

    const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const savingsTotal = expenses.reduce(
        (sum, item) => sum + (item.account_name ? Number(item.amount) : 0),
        0,
    );
    const showCategoryChart =
        Boolean(filters.show_category_chart) && expenseByCategory.length > 0;

    const expenseByCategorySorted = useMemo(
        () => [...expenseByCategory].sort((a, b) => Number(b.value) - Number(a.value)),
        [expenseByCategory],
    );

    const periodLabel = [filters.start_date, filters.end_date].filter(Boolean).join(' — ');

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Расходы</h2>}
        >
            <Head title="Расходы" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-medium">Действия</h3>
                            <Link href={route('expense-categories.index')} className="text-sm text-indigo-600">
                                Управление категориями
                            </Link>
                        </div>
                        <div className="mb-4">
                            <Link href={route('expenses.create')}>
                                <PrimaryButton>Добавить расход</PrimaryButton>
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                get(route('expenses.index'), {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            className="grid gap-3 md:grid-cols-4"
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
                            <div>
                                <InputLabel htmlFor="category_id" value="Категория" />
                                <select
                                    id="category_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={filterData.category_id}
                                    onChange={(e) => setFilterData('category_id', e.target.value)}
                                >
                                    <option value="">Все</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <PrimaryButton>Применить</PrimaryButton>
                                <button
                                    type="button"
                                    className="rounded-md border px-3 py-2 text-sm"
                                    onClick={() => router.get(route('expenses.index'))}
                                >
                                    Сброс
                                </button>
                            </div>
                        </form>
                    </div>

                    {showCategoryChart && (
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <h3 className="mb-4 text-lg font-medium text-gray-800">
                                Расходы по категориям{periodLabel ? ` за период ${periodLabel}` : ''}
                            </h3>
                            <div
                                className="w-full min-h-[18rem]"
                                style={{ height: Math.max(288, expenseByCategorySorted.length * 40 || 288) }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={expenseByCategorySorted}
                                        margin={CATEGORY_BAR_MARGIN}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(v) => (Number.isFinite(v) ? Number(v).toFixed(0) : v)}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={148}
                                            tick={{ fontSize: 12 }}
                                            interval={0}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${Number(value).toFixed(2)}`, 'Сумма']}
                                            labelFormatter={(label) => label}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                            <LabelList
                                                dataKey="value"
                                                position="right"
                                                offset={8}
                                                formatter={(v) =>
                                                    typeof v === 'number' ? v.toFixed(2) : Number(v).toFixed(2)
                                                }
                                                style={{
                                                    fill: '#111827',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                }}
                                            />
                                            {expenseByCategorySorted.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color ?? '#9CA3AF'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-medium">Список</h3>
                            <p className="text-right text-sm text-gray-600">
                                Итого: {total.toFixed(2)}
                                {savingsTotal > 0 ? (
                                    <span className="mt-0.5 block text-amber-700">в копилку: {savingsTotal.toFixed(2)}</span>
                                ) : null}
                            </p>
                        </div>
                        <div className="space-y-2">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between rounded border p-3">
                                    <div>
                                        <p className="font-medium">{expense.spent_on}</p>
                                        <p className="text-sm text-gray-600">
                                            {expense.category_name} {expense.note ? `- ${expense.note}` : ''}
                                            {expense.account_name ? (
                                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                                                    Копилка · {expense.account_name}
                                                </span>
                                            ) : null}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold tabular-nums text-gray-900">
                                            {Number(expense.amount).toFixed(2)}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link
                                                href={expenseEditUrl(expense.id)}
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
                                                    if (!window.confirm('Удалить расход?')) return;
                                                    router.delete(route('expenses.destroy', expense.id));
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
                            {expenses.length === 0 && (
                                <p className="text-sm text-gray-600">Пока нет расходов.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
