import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

export default function Index({ tasks, filters }) {
    const { data: filterData, setData: setFilterData, get } = useForm({
        date: filters.date ?? '',
        end_date: filters.end_date ?? '',
    });

    const applyFilter = (e) => {
        e.preventDefault();
        get(route('tasks.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleComplete = (task) => {
        router.patch(
            route('tasks.toggle-complete', task.id),
            { is_completed: !task.is_completed },
            { preserveScroll: true },
        );
    };

    const removeTask = (taskId) => {
        if (!window.confirm('Удалить задачу?')) return;
        router.delete(route('tasks.destroy', taskId));
    };

    // Генерируем список дней в диапазоне, чтобы показать блоки для каждого дня
    const daysInRange = useMemo(() => {
        if (!filterData.date || !filterData.end_date) return [];

        const [sy, sm, sd] = filterData.date.split('-').map(Number);
        const [ey, em, ed] = filterData.end_date.split('-').map(Number);

        const start = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);
        const dates = [];

        let current = new Date(start);
        while (current <= end) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);

            current.setDate(current.getDate() + 1);
            if (dates.length > 31) break; // Защита от бесконечного цикла или слишком большого диапазона
        }
        return dates;
    }, [filterData.date, filterData.end_date]);

    const groupedTasks = tasks.reduce((acc, task) => {
        const day = task.due_date;
        acc[day] = acc[day] || [];
        acc[day].push(task);
        return acc;
    }, {});

    const dayLabels = useMemo(() => {
        const labels = {};
        const daysOfWeek = [
            'воскресенье',
            'понедельник',
            'вторник',
            'среда',
            'четверг',
            'пятница',
            'суббота',
        ];

        // Добавляем метки для всех дней в диапазоне
        daysInRange.forEach((day) => {
            const [y, m, d] = day.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            labels[day] = `${day} ${daysOfWeek[date.getDay()]}`;
        });

        // И для дней из задач, которые могут быть вне диапазона (если фильтр не задан)
        Object.keys(groupedTasks).forEach((day) => {
            if (!labels[day]) {
                const [y, m, d] = day.split('-').map(Number);
                const date = new Date(y, m - 1, d);
                labels[day] = `${day} ${daysOfWeek[date.getDay()]}`;
            }
        });

        return labels;
    }, [daysInRange, groupedTasks]);

    const editHref = (taskId) =>
        route('tasks.edit', {
            task: taskId,
            ...(filterData.date ? { date: filterData.date } : {}),
            ...(filterData.end_date ? { end_date: filterData.end_date } : {}),
        });

    const createHref = filterData.date
        ? route('tasks.create', { date: filterData.date })
        : route('tasks.create');

    const shiftPeriod = (days) => {
        if (!filterData.date || !filterData.end_date) return;

        const [sy, sm, sd] = filterData.date.split('-').map(Number);
        const [ey, em, ed] = filterData.end_date.split('-').map(Number);

        const start = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);

        start.setDate(start.getDate() + days);
        end.setDate(end.getDate() + days);

        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const newStart = formatDate(start);
        const newEnd = formatDate(end);

        router.get(route('tasks.index'), {
            date: newStart,
            end_date: newEnd,
        }, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    // Определяем, какие дни отображать
    const displayDays = daysInRange.length > 0 ? daysInRange : Object.keys(groupedTasks).sort();

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Задачи</h2>}
        >
            <Head title="Задачи" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <Link href={createHref}>
                                <PrimaryButton>Добавить задачу</PrimaryButton>
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3">
                            <div>
                                <InputLabel htmlFor="date-filter" value="С" />
                                <TextInput
                                    id="date-filter"
                                    type="date"
                                    value={filterData.date}
                                    onChange={(e) => setFilterData('date', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="end-date-filter" value="До" />
                                <TextInput
                                    id="end-date-filter"
                                    type="date"
                                    value={filterData.end_date}
                                    onChange={(e) => setFilterData('end_date', e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <PrimaryButton>Применить</PrimaryButton>
                                <button
                                    type="button"
                                    onClick={() => shiftPeriod(-7)}
                                    title="Назад на неделю"
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    &larr;
                                </button>
                                <button
                                    type="button"
                                    onClick={() => shiftPeriod(7)}
                                    title="Вперед на неделю"
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    &rarr;
                                </button>
                            </div>
                            <button
                                type="button"
                                className="rounded-md border px-3 py-2 text-sm"
                                onClick={() => {
                                    setFilterData({ date: '', end_date: '' });
                                    router.get(`${route('tasks.index')}?date=&end_date=`);
                                }}
                            >
                                Сброс
                            </button>
                        </form>
                    </div>

                    {displayDays.length === 0 && (
                        <div className="rounded-lg bg-white p-6 text-gray-600 shadow-sm">
                            Пока нет задач в выбранном периоде.
                        </div>
                    )}

                    {displayDays.map((day) => {
                        const dayTasks = groupedTasks[day] || [];
                        if (dayTasks.length === 0 && daysInRange.length === 0) return null;

                        return (
                            <div key={day} className="rounded-lg bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-semibold capitalize text-gray-900">
                                    {dayLabels[day]}
                                </h3>
                                <div className="space-y-3">
                                    {dayTasks.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Задач на этот день нет</p>
                                    ) : (
                                        dayTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-start justify-between gap-3 rounded border p-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium">
                                                        {task.title}
                                                        {task.due_time ? (
                                                            <span className="ml-2 font-mono text-sm font-normal tabular-nums text-gray-600">
                                                                {task.due_time}
                                                            </span>
                                                        ) : null}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{task.description}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {task.is_completed ? 'Выполнено' : 'Открыто'}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        type="button"
                                                        title={task.is_completed ? 'Отметить как невыполненную' : 'Выполнено'}
                                                        className={`rounded-md border p-2 text-sm ${
                                                            task.is_completed
                                                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                                                : 'border-gray-300 bg-white text-gray-600'
                                                        }`}
                                                        onClick={() => toggleComplete(task)}
                                                    >
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                            <path
                                                                d="M5 13l4 4L19 7"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                        <span className="sr-only">
                                                            {task.is_completed ? 'Отметить как невыполненную' : 'Выполнено'}
                                                        </span>
                                                    </button>
                                                    <Link
                                                        href={editHref(task.id)}
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
                                                        onClick={() => removeTask(task.id)}
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
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
