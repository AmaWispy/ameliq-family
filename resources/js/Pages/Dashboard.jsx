import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    Cell,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const CARTESIAN_MARGIN = { top: 8, right: 8, left: 8, bottom: 8 };

/** Поля слева под длинные названия категорий в горизонтальной гистограмме. */
const CATEGORY_BAR_MARGIN = { top: 8, right: 16, left: 8, bottom: 8 };

export default function Dashboard({
    stats,
    monthly,
    expense_by_category: expenseByCategory,
    task_calendar: taskCalendar = {},
    calendar_month: initialCalendarMonth,
}) {
    const balance = Number(stats.total_income) - Number(stats.total_expense);
    const [calendarMonth, setCalendarMonth] = useState(
        initialCalendarMonth ?? new Date().toISOString().slice(0, 7),
    );

    const todayKey = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }, []);

    const calendarDate = useMemo(() => {
        const [yearString, monthString] = calendarMonth.split('-');
        const year = Number(yearString) || new Date().getFullYear();
        const month = Number(monthString) || 1;

        return new Date(year, month - 1, 1);
    }, [calendarMonth]);

    const monthLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('ru-RU', {
                month: 'long',
                year: 'numeric',
            }).format(calendarDate),
        [calendarDate],
    );

    const calendarCells = useMemo(() => {
        const year = calendarDate.getFullYear();
        const monthIndex = calendarDate.getMonth();
        const month = monthIndex + 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayIndex = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
        const cells = [];

        for (let index = 0; index < firstDayIndex; index += 1) {
            cells.push(null);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const tasks = taskCalendar[dateKey] ?? null;

            cells.push({
                day,
                dateKey,
                tasks,
                isToday: dateKey === todayKey,
            });
        }

        while (cells.length % 7 !== 0) {
            cells.push(null);
        }

        return cells;
    }, [calendarDate, taskCalendar, todayKey]);

    const changeCalendarMonth = (delta) => {
        setCalendarMonth((value) => {
            const [yearString, monthString] = value.split('-');
            const year = Number(yearString) || new Date().getFullYear();
            const month = Number(monthString) || 1;
            const nextMonth = new Date(year, month - 1 + delta, 1);

            return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
        });
    };

    const todayLabel = useMemo(() => {
        const d = new Date(`${todayKey}T12:00:00`);
        return new Intl.DateTimeFormat('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(d);
    }, [todayKey]);

    const todaySummary = taskCalendar[todayKey] ?? null;

    const expenseByCategorySorted = useMemo(
        () => [...expenseByCategory].sort((a, b) => Number(b.value) - Number(a.value)),
        [expenseByCategory],
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Дашборд
                </h2>
            }
        >
            <Head title="Дашборд" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Баланс за период</p>
                        <p className="mt-1 text-3xl font-semibold text-indigo-700 tabular-nums">{balance.toFixed(2)}</p>
                        <p className="mt-2 text-xs text-gray-500">
                            {stats.period_start} — {stats.period_end}
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800">Задачи на сегодня</h3>
                                <p className="mt-1 text-sm capitalize text-gray-600">{todayLabel}</p>
                                {todaySummary ? (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Всего: {todaySummary.total}. Открыто: {todaySummary.open}, выполнено:{' '}
                                        {todaySummary.total - todaySummary.open}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-600">На сегодня задач нет.</p>
                                )}
                            </div>
                            <Link
                                href={route('tasks.index', { date: todayKey })}
                                className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Все задачи на этот день
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-medium text-gray-800">Календарь задач</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => changeCalendarMonth(-1)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Назад
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeCalendarMonth(1)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Вперед
                                </button>
                            </div>
                        </div>
                        <p className="mb-3 text-sm capitalize text-gray-600">{monthLabel}</p>
                        <div className="mb-1 grid grid-cols-7 gap-1">
                            {WEEK_DAYS.map((dayName) => (
                                <div key={dayName} className="py-1 text-center text-xs font-medium text-gray-500">
                                    {dayName}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarCells.map((cell, index) =>
                                cell ? (
                                    <Link
                                        key={cell.dateKey}
                                        href={route('tasks.index', { date: cell.dateKey })}
                                        className={`block min-h-16 rounded-md border p-2 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                                            cell.tasks ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'
                                        } hover:border-indigo-300 hover:bg-indigo-50/60 ${cell.isToday ? 'ring-1 ring-indigo-500' : ''}`}
                                        aria-label={`Задачи на ${cell.dateKey}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-gray-800">{cell.day}</span>
                                            {cell.tasks ? (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        cell.tasks.open > 0
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-emerald-100 text-emerald-700'
                                                    }`}
                                                >
                                                    {cell.tasks.total}
                                                </span>
                                            ) : null}
                                        </div>
                                    </Link>
                                ) : (
                                    <div key={`empty-${index}`} className="min-h-16 rounded-md bg-gray-50" />
                                ),
                            )}
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Нажмите на день, чтобы открыть список задач с фильтром по этой дате. Число в кружке — количество
                            задач на день.
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-800">
                            Расходы по категориям (последние 6 периодов 10-10)
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
                                        formatter={(value) => [
                                            `${Number(value).toFixed(2)}`,
                                            'Сумма',
                                        ]}
                                        labelFormatter={(label) => label}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                        {expenseByCategorySorted.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color ?? '#9CA3AF'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-800">
                            Доходы и расходы (последние 6 периодов 10-10)
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthly} margin={CARTESIAN_MARGIN}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="income" name="Доход" stroke="#16a34a" strokeWidth={2} />
                                    <Line type="monotone" dataKey="expense" name="Расход" stroke="#dc2626" strokeWidth={2} />
                                    <Line type="monotone" dataKey="balance" name="Баланс" stroke="#4f46e5" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-800">Итоги по периодам 10-10</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthly} margin={CARTESIAN_MARGIN}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="income" name="Доход" fill="#22c55e" />
                                    <Bar dataKey="expense" name="Расход" fill="#ef4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Доход за период</p>
                            <p className="mt-1 text-2xl font-semibold text-green-700 tabular-nums">
                                {Number(stats.total_income).toFixed(2)}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                {stats.period_start} — {stats.period_end}
                            </p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Расход за период</p>
                            <p className="mt-1 text-2xl font-semibold text-red-700 tabular-nums">
                                {Number(stats.total_expense).toFixed(2)}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                {stats.period_start} — {stats.period_end}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
