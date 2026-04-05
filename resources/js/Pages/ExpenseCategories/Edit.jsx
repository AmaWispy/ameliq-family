import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        color: category.color,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('expense-categories.update', category.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Редактировать категорию</h2>}
        >
            <Head title="Редактировать категорию" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                            <div>
                                <InputLabel htmlFor="name" value="Название категории" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="color" value="Цвет" />
                                <input
                                    id="color"
                                    type="color"
                                    className="mt-1 block h-10 w-14 rounded border border-gray-300 bg-white"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                />
                                <InputError message={errors.color} className="mt-1" />
                            </div>
                            <PrimaryButton disabled={processing}>Сохранить</PrimaryButton>
                            <Link href={route('expense-categories.index')} className="rounded-md border px-3 py-2 text-sm">
                                Назад
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
