import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTimeInput } from '@/utils/formatTimeInput';
import { TASK_COLORS } from '@/utils/taskColors';
import { Head, Link, useForm } from '@inertiajs/react';

const today = new Date().toISOString().split('T')[0];

export default function Create({ defaultDueDate }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        due_date: defaultDueDate ?? today,
        due_time: '',
        is_completed: false,
        is_heavy: false,
        color: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tasks.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Новая задача</h2>}
        >
            <Head title="Новая задача" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="title" value="Заголовок" />
                                <TextInput
                                    id="title"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                <InputError message={errors.title} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="due_date" value="Дата" />
                                <TextInput
                                    id="due_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                />
                                <InputError message={errors.due_date} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="due_time" value="Время" />
                                <TextInput
                                    id="due_time"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="00:00"
                                    maxLength={5}
                                    className="mt-1 block w-full max-w-[8rem] font-mono tabular-nums"
                                    value={data.due_time}
                                    onChange={(e) => setData('due_time', formatTimeInput(e.target.value))}
                                />
                                <InputError message={errors.due_time} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="description" value="Описание" />
                                <textarea
                                    id="description"
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel value="Цвет" />
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('color', '')}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                            !data.color
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Без цвета
                                    </button>
                                    {TASK_COLORS.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            title={item.label}
                                            onClick={() => setData('color', item.value)}
                                            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm ${
                                                data.color === item.value
                                                    ? 'border-gray-900 bg-white shadow-sm'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span
                                                className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                                                style={{ backgroundColor: item.hex }}
                                            />
                                            <span className="text-gray-700">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.color} className="mt-1" />
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_completed}
                                    onChange={(e) => setData('is_completed', e.target.checked)}
                                />
                                Выполнено
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_heavy}
                                    onChange={(e) => setData('is_heavy', e.target.checked)}
                                />
                                Тяжёлая задача
                                <span className="text-xs text-gray-500">(день выделится в календаре)</span>
                            </label>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <PrimaryButton disabled={processing}>Создать</PrimaryButton>
                                <Link href={route('tasks.index')} className="rounded-md border px-3 py-2 text-sm">
                                    Назад
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
