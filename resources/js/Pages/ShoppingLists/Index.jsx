import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ shoppingLists }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Списки</h2>}
        >
            <Head title="Списки" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-3 text-lg font-medium">Действия</h3>
                        <Link href={route('shopping-lists.create')}>
                            <PrimaryButton>Создать список</PrimaryButton>
                        </Link>
                    </div>

                    {shoppingLists.length === 0 && (
                        <div className="rounded-lg bg-white p-6 text-gray-600 shadow-sm">
                            Пока нет списков.
                        </div>
                    )}

                    {shoppingLists.map((list) => (
                        <div key={list.id} className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <Link href={route('shopping-lists.show', list.id)} className="text-lg font-semibold text-indigo-700 hover:underline">
                                    {list.name}
                                </Link>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">
                                        Элементов: {list.items_count}
                                    </span>
                                    <Link
                                        href={route('shopping-lists.edit', list.id)}
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
                                            if (!window.confirm('Удалить список?')) return;
                                            router.delete(route('shopping-lists.destroy', list.id));
                                        }}
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                            <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                            <path d="M8 7l1 12h6l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                        </svg>
                                        <span className="sr-only">Удалить список</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
