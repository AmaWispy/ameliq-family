import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ expense, categories, return_filters: returnFilters }) {
    const { data, setData, put, processing, errors } = useForm({
        expense_category_id: String(expense.expense_category_id),
        spent_on: expense.spent_on,
        amount: String(expense.amount),
        note: expense.note ?? '',
        return_start_date: returnFilters.start_date ?? '',
        return_end_date: returnFilters.end_date ?? '',
        return_category_id: returnFilters.category_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('expenses.update', expense.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Редактировать расход</h2>}
        >
            <Head title="Редактировать расход" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="expense_category_id" value="Категория" />
                                <select
                                    id="expense_category_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.expense_category_id}
                                    onChange={(e) => setData('expense_category_id', e.target.value)}
                                >
                                    <option value="">Выберите категорию</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.expense_category_id} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="spent_on" value="Дата" />
                                <TextInput
                                    id="spent_on"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.spent_on}
                                    onChange={(e) => setData('spent_on', e.target.value)}
                                />
                                <InputError message={errors.spent_on} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="amount" value="Сумма" />
                                <TextInput
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                />
                                <InputError message={errors.amount} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="note" value="Комментарий" />
                                <TextInput
                                    id="note"
                                    className="mt-1 block w-full"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                />
                                <InputError message={errors.note} className="mt-1" />
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <PrimaryButton disabled={processing}>Сохранить</PrimaryButton>
                                <Link href={route('expenses.index')} className="rounded-md border px-3 py-2 text-sm">
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
