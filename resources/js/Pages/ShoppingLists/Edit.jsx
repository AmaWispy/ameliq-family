import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ shoppingList, return_to: returnTo }) {
    const { data, setData, put, processing, errors } = useForm({
        name: shoppingList.name,
        return_to: returnTo ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('shopping-lists.update', shoppingList.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Редактировать список</h2>}
        >
            <Head title="Редактировать список" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                            <div>
                                <InputLabel htmlFor="name" value="Название списка" />
                                <TextInput
                                    id="name"
                                    className="mt-1"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.name} />
                            </div>
                            <PrimaryButton disabled={processing}>Сохранить</PrimaryButton>
                            <Link
                                href={
                                    data.return_to === 'show'
                                        ? route('shopping-lists.show', shoppingList.id)
                                        : route('shopping-lists.index')
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                Назад
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
