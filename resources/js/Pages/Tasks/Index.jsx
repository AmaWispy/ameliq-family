import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Index({ tasks, filters }) {
    const { data: filterData, setData: setFilterData, get } = useForm({
        date: filters.date ?? '',
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

    const groupedTasks = tasks.reduce((acc, task) => {
        const day = task.due_date;
        acc[day] = acc[day] || [];
        acc[day].push(task);
        return acc;
    }, {});

    const editHref = (taskId) =>
        route('tasks.edit', {
            task: taskId,
            ...(filterData.date ? { date: filterData.date } : {}),
        });

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Задачи по дням</h2>}
        >
            <Head title="Задачи" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <Link href={route('tasks.create')}>
                                <PrimaryButton>Добавить задачу</PrimaryButton>
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3">
                            <div>
                                <InputLabel htmlFor="date-filter" value="Фильтр по дате" />
                                <TextInput
                                    id="date-filter"
                                    type="date"
                                    value={filterData.date}
                                    onChange={(e) => setFilterData('date', e.target.value)}
                                />
                            </div>
                            <PrimaryButton>Применить</PrimaryButton>
                            <button
                                type="button"
                                className="rounded-md border px-3 py-2 text-sm"
                                onClick={() => {
                                    setFilterData('date', '');
                                    router.get(`${route('tasks.index')}?date=`);
                                }}
                            >
                                Сброс
                            </button>
                        </form>
                    </div>

                    {Object.keys(groupedTasks).length === 0 && (
                        <div className="rounded-lg bg-white p-6 text-gray-600 shadow-sm">
                            Пока нет задач.
                        </div>
                    )}

                    {Object.entries(groupedTasks).map(([day, dayTasks]) => (
                        <div key={day} className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">{day}</h3>
                            <div className="space-y-3">
                                {dayTasks.map((task) => (
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
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
