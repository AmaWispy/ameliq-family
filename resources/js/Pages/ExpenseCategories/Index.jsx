import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Index({ categories }) {
    const page = usePage();

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Категории расходов</h2>}
        >
            <Head title="Категории расходов" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <Link href={route('expense-categories.create')}>
                            <PrimaryButton>Добавить категорию</PrimaryButton>
                        </Link>
                        {page.props.errors?.category && (
                            <p className="mt-3 text-sm text-red-600">{page.props.errors.category}</p>
                        )}
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium">Список</h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between rounded border p-3">
                                    <div>
                                        <p className="flex items-center gap-2 font-medium">
                                            <span
                                                className="inline-block h-3 w-3 rounded-full border border-gray-300"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            {category.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Расходов: {category.expenses_count}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={route('expense-categories.edit', category.id)}
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
                                                if (!window.confirm('Удалить категорию расходов?')) return;
                                                router.delete(route('expense-categories.destroy', category.id));
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
                            {categories.length === 0 && (
                                <p className="text-sm text-gray-600">Пока нет категорий.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
