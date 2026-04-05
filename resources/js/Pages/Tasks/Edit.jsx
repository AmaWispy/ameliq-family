import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTimeInput } from '@/utils/formatTimeInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ task, return_date: returnDate }) {
    const { data, setData, put, processing, errors } = useForm({
        title: task.title,
        description: task.description ?? '',
        due_date: task.due_date,
        due_time: task.due_time ?? '',
        is_completed: task.is_completed,
        return_date: returnDate ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('tasks.update', task.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Редактировать задачу</h2>}
        >
            <Head title="Редактировать задачу" />

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
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_completed}
                                    onChange={(e) => setData('is_completed', e.target.checked)}
                                />
                                Выполнено
                            </label>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <PrimaryButton disabled={processing}>Сохранить</PrimaryButton>
                                <Link href={route('tasks.index', { date: data.return_date || undefined })} className="rounded-md border px-3 py-2 text-sm">
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
