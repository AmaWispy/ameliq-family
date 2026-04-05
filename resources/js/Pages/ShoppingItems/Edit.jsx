import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ shoppingItem, shopping_list_id: shoppingListId }) {
    const { data, setData, put, processing, errors } = useForm({
        name: shoppingItem.name,
        quantity: String(shoppingItem.quantity),
        is_checked: shoppingItem.is_checked,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('shopping-items.update', shoppingItem.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Редактировать продукт</h2>}
        >
            <Head title="Редактировать продукт" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="name" value="Название" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.name} />
                            </div>
                            <div>
                                <InputLabel htmlFor="quantity" value="Количество" />
                                <TextInput
                                    id="quantity"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.quantity} />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_checked}
                                    onChange={(e) => setData('is_checked', e.target.checked)}
                                />
                                Куплено
                            </label>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <PrimaryButton disabled={processing}>Сохранить</PrimaryButton>
                                <Link
                                    href={route('shopping-lists.show', shoppingListId)}
                                    className="rounded-md border px-3 py-2 text-sm"
                                >
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
