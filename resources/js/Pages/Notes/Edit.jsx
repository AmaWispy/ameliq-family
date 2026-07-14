import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const TYPE_TITLES = {
    note: 'Редактировать заметку',
    password: 'Редактировать пароль',
    address: 'Редактировать адрес',
};

function NoteFields({ data, setData, errors }) {
    return (
        <div className="mt-4">
            <InputLabel htmlFor="content" value="Описание *" />
            <textarea
                id="content"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="10"
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                required
            />
            <InputError message={errors.content} className="mt-2" />
        </div>
    );
}

function PasswordFields({ data, setData, errors }) {
    return (
        <>
            <div className="mt-4">
                <InputLabel htmlFor="url" value="Ссылка" />
                <TextInput
                    id="url"
                    type="text"
                    className="mt-1 block w-full"
                    value={data.url}
                    onChange={(e) => setData('url', e.target.value)}
                    autoComplete="off"
                    placeholder="https://"
                />
                <InputError message={errors.url} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="login" value="Логин *" />
                <TextInput
                    id="login"
                    className="mt-1 block w-full"
                    value={data.login}
                    onChange={(e) => setData('login', e.target.value)}
                    required
                    autoComplete="off"
                />
                <InputError message={errors.login} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="password" value="Пароль *" />
                <TextInput
                    id="password"
                    type="text"
                    className="mt-1 block w-full"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required
                    autoComplete="off"
                />
                <InputError message={errors.password} className="mt-2" />
            </div>
        </>
    );
}

function AddressFields({ data, setData, errors }) {
    return (
        <>
            <div className="mt-4">
                <InputLabel htmlFor="url" value="Ссылка" />
                <TextInput
                    id="url"
                    type="text"
                    className="mt-1 block w-full"
                    value={data.url}
                    onChange={(e) => setData('url', e.target.value)}
                    autoComplete="off"
                    placeholder="https://"
                />
                <InputError message={errors.url} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="address" value="Текстовый адрес" />
                <textarea
                    id="address"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="4"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                />
                <InputError message={errors.address} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="coordinates" value="Координаты" />
                <TextInput
                    id="coordinates"
                    className="mt-1 block w-full"
                    value={data.coordinates}
                    onChange={(e) => setData('coordinates', e.target.value)}
                    autoComplete="off"
                    placeholder="55.751244, 37.618423"
                />
                <InputError message={errors.coordinates} className="mt-2" />
            </div>
        </>
    );
}

export default function Edit({ note }) {
    const type = note.type ?? 'note';
    const { data, setData, patch, processing, errors } = useForm({
        type,
        title: note.title ?? '',
        content: note.content ?? '',
        url: note.url ?? '',
        login: note.login ?? '',
        password: note.password ?? '',
        address: note.address ?? '',
        coordinates: note.coordinates ?? '',
        is_favorite: note.is_favorite ?? false,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('notes.update', note.id));
    };

    const pageTitle = TYPE_TITLES[type] ?? TYPE_TITLES.note;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{pageTitle}</h2>}
        >
            <Head title={pageTitle} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div>
                                <InputLabel htmlFor="title" value="Название *" />
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

                            {type === 'note' && <NoteFields data={data} setData={setData} errors={errors} />}
                            {type === 'password' && <PasswordFields data={data} setData={setData} errors={errors} />}
                            {type === 'address' && <AddressFields data={data} setData={setData} errors={errors} />}

                            <div className="mt-4">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_favorite"
                                        checked={data.is_favorite}
                                        onChange={(e) => setData('is_favorite', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600">В избранное</span>
                                </label>
                            </div>

                            <div className="mt-6 flex items-center justify-end">
                                <Link
                                    href={route('notes.index', { type })}
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
