import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

function NewItemForm({ listId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        quantity: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('shopping-items.store', listId), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="mt-3 grid gap-2 md:grid-cols-4">
            <div className="md:col-span-2">
                <TextInput
                    placeholder="Название продукта"
                    className="w-full"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                <InputError className="mt-1" message={errors.name} />
            </div>
            <div>
                <TextInput
                    type="number"
                    step="0.01"
                    placeholder="Кол-во (пусто -> 1)"
                    className="w-full"
                    value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)}
                />
                <InputError className="mt-1" message={errors.quantity} />
            </div>
            <div>
                <PrimaryButton disabled={processing}>Добавить продукт</PrimaryButton>
            </div>
        </form>
    );
}

export default function Show({ shoppingList }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{shoppingList.name}</h2>}
        >
            <Head title={shoppingList.name} />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Link href={route('shopping-lists.index')} className="rounded-md border px-3 py-2 text-sm">
                                Назад к спискам
                            </Link>
                            <Link
                                href={`${route('shopping-lists.edit', shoppingList.id)}?return_to=show`}
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                Редактировать название
                            </Link>
                        </div>

                        <NewItemForm listId={shoppingList.id} />

                        <div className="mt-4 space-y-2">
                            {shoppingList.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded border p-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={item.is_checked}
                                            onChange={() =>
                                                router.put(route('shopping-items.update', item.id), {
                                                    name: item.name,
                                                    quantity: item.quantity,
                                                    is_checked: !item.is_checked,
                                                })
                                            }
                                        />
                                        <span
                                            className={
                                                item.is_checked
                                                    ? 'text-gray-500 line-through'
                                                    : 'text-gray-900'
                                            }
                                        >
                                            {item.name}
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">Кол-во: {item.quantity}</span>
                                        <Link
                                            href={route('shopping-items.edit', item.id)}
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
                                            onClick={() => {
                                                if (!window.confirm('Удалить продукт из списка?')) return;
                                                router.delete(route('shopping-items.destroy', item.id));
                                            }}
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
                            {shoppingList.items.length === 0 && (
                                <p className="text-sm text-gray-600">В этом списке пока нет продуктов.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
