import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        note: '',
        goal_amount: '',
        initial_amount: '',
        is_negative: false,
        is_favorite: false,
        create_expense: false,
        deduct_from_balance: false,
        expense_category_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('accounts.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Новая копилка</h2>}>
            <Head title="Новая копилка" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="grid gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Название *" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    isFocused
                                />
                                <InputError className="mt-1" message={errors.name} />
                            </div>
                            <div>
                                <InputLabel htmlFor="note" value="Описание" />
                                <TextInput
                                    id="note"
                                    className="mt-1 block w-full"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.note} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="goal_amount" value="Цель" />
                                    <TextInput
                                        id="goal_amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="mt-1 block w-full"
                                        value={data.goal_amount}
                                        onChange={(e) => setData('goal_amount', e.target.value)}
                                        placeholder="Необязательно"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Можно накопить больше цели.</p>
                                    <InputError className="mt-1" message={errors.goal_amount} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="initial_amount" value="Начальный остаток" />
                                    <TextInput
                                        id="initial_amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="mt-1 block w-full"
                                        value={data.initial_amount}
                                        onChange={(e) => setData('initial_amount', e.target.value)}
                                        placeholder="0"
                                    />
                                    <InputError className="mt-1" message={errors.initial_amount} />
                                </div>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <Checkbox
                                    checked={data.is_favorite}
                                    onChange={(e) => setData('is_favorite', e.target.checked)}
                                />
                                В избранное
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <Checkbox
                                    checked={data.is_negative}
                                    onChange={(e) => setData('is_negative', e.target.checked)}
                                />
                                Отрицательная копилка (долг / кредит)
                            </label>
                            {data.is_negative ? (
                                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    Копилка будет выделена красным. Пополнение увеличивает долг, снятие — уменьшает его.
                                </p>
                            ) : null}
                            {!data.is_negative ? (
                                <div className="grid gap-2">
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <Checkbox
                                            checked={data.deduct_from_balance}
                                            onChange={(e) => setData('deduct_from_balance', e.target.checked)}
                                        />
                                        Снять начальный остаток с баланса
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <Checkbox
                                            checked={data.create_expense}
                                            onChange={(e) => setData('create_expense', e.target.checked)}
                                        />
                                        Создать расход на начальный остаток
                                    </label>
                                    {data.create_expense ? (
                                        <div>
                                            <InputLabel htmlFor="expense_category_id" value="Категория расхода *" />
                                            <select
                                                id="expense_category_id"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                value={data.expense_category_id}
                                                onChange={(e) => setData('expense_category_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Выберите категорию</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Расход попадёт в общий баланс и будет отмечен как перевод в копилку.
                                            </p>
                                            <InputError className="mt-1" message={errors.expense_category_id} />
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                            <div className="flex items-center gap-2">
                                <PrimaryButton disabled={processing}>Создать</PrimaryButton>
                                <Link href={route('accounts.index')} className="rounded-md border px-3 py-2 text-sm">
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
