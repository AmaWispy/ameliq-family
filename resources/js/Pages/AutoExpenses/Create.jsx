import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        expense_category_id: '',
        charge_day: String(new Date().getDate()),
        amount: '',
        note: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('auto-expenses.store'));
    };

    if (categories.length === 0) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Новый авторасход</h2>}
            >
                <Head title="Новый авторасход" />
                <div className="py-8">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-gray-600">
                                Сначала создайте{' '}
                                <Link href={route('expense-categories.index')} className="text-indigo-600">
                                    категорию расхода
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Новый авторасход</h2>}
        >
            <Head title="Новый авторасход" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
                                <InputError message={errors.name} className="mt-1" />
                            </div>
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
                                <InputLabel htmlFor="charge_day" value="День списания (число месяца)" />
                                <TextInput
                                    id="charge_day"
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="mt-1 block w-full"
                                    value={data.charge_day}
                                    onChange={(e) => setData('charge_day', e.target.value)}
                                />
                                <InputError message={errors.charge_day} className="mt-1" />
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
                                <InputLabel htmlFor="note" value="Комментарий (необязательно)" />
                                <TextInput
                                    id="note"
                                    className="mt-1 block w-full"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                />
                                <InputError message={errors.note} className="mt-1" />
                            </div>
                            <div className="flex items-center md:col-span-2">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600">Активен</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <PrimaryButton disabled={processing}>Создать</PrimaryButton>
                                <Link href={route('auto-expenses.index')} className="rounded-md border px-3 py-2 text-sm">
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
