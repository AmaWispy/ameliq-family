import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function parseShoppingLines(text) {
    return String(text ?? '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const match = line.match(/^(.*)\s+(\d+(?:[.,]\d+)?)$/);
            if (match && match[1].trim()) {
                return {
                    name: match[1].trim(),
                    quantity: Number(match[2].replace(',', '.')),
                };
            }

            return { name: line, quantity: 1 };
        });
}

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
                    placeholder="Название элемента"
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
                <PrimaryButton disabled={processing}>Добавить элемент</PrimaryButton>
            </div>
        </form>
    );
}

function BulkItemsModal({ listId, show, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        text: '',
    });

    const preview = useMemo(() => parseShoppingLines(data.text).slice(0, 200), [data.text]);

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('shopping-items.store-bulk', listId), {
            onSuccess: () => close(),
        });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Добавить списком</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Каждая строка — отдельный продукт. Число в конце строки станет количеством.
                </p>

                <textarea
                    className="mt-4 block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={10}
                    placeholder={'молоко 3\nкефир 1\nчебуреки\nморковь чищенная 1.5'}
                    value={data.text}
                    onChange={(e) => setData('text', e.target.value)}
                    autoFocus
                />
                <InputError className="mt-2" message={errors.text} />

                {preview.length > 0 ? (
                    <p className="mt-3 text-sm text-gray-600">
                        Будет добавлено: {preview.length}
                    </p>
                ) : (
                    <p className="mt-3 text-sm text-gray-400">Пока нет строк для добавления.</p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={close}>
                        Отмена
                    </SecondaryButton>
                    <PrimaryButton disabled={processing || preview.length === 0}>
                        Добавить
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

export default function Show({ shoppingList }) {
    const [showBulkModal, setShowBulkModal] = useState(false);

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
                            <button
                                type="button"
                                onClick={() => setShowBulkModal(true)}
                                className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                            >
                                Добавить списком
                            </button>
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
                                                if (!window.confirm('Удалить элемент из списка?')) return;
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
                                <p className="text-sm text-gray-600">В этом списке пока нет элементов.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <BulkItemsModal
                listId={shoppingList.id}
                show={showBulkModal}
                onClose={() => setShowBulkModal(false)}
            />
        </AuthenticatedLayout>
    );
}
