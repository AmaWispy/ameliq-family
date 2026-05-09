import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        is_favorite: false,
        is_password: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('notes.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Новая заметка</h2>}
        >
            <Head title="Новая заметка" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div>
                                <InputLabel htmlFor="title" value="Название" />
                                <TextInput
                                    id="title"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="off"
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="content" value="Текст заметки" />
                                <textarea
                                    id="content"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="10"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                ></textarea>
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-6">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_favorite"
                                        checked={data.is_favorite}
                                        onChange={(e) => setData('is_favorite', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600">В избранное</span>
                                </label>

                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_password"
                                        checked={data.is_password}
                                        onChange={(e) => setData('is_password', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600">Это пароль (зашифровать)</span>
                                </label>
                            </div>

                            <div className="mt-6 flex items-center justify-end">
                                <Link
                                    href={route('notes.index')}
                                    className="text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Отмена
                                </Link>
                                <PrimaryButton className="ms-4" disabled={processing}>
                                    Сохранить
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
