import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ account }) {
    const { data, setData, put, processing, errors } = useForm({
        name: account.name,
        note: account.note ?? '',
        goal_amount: account.goal_amount === '' || account.goal_amount == null ? '' : account.goal_amount,
        is_negative: account.is_negative,
        is_favorite: account.is_favorite,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('accounts.update', account.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Редактировать копилку</h2>}>
            <Head title="Редактировать копилку" />

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
                            <div className="flex items-center gap-2">
                                <PrimaryButton disabled={processing}>Сохранить</PrimaryButton>
                                <Link href={route('accounts.show', account.id)} className="rounded-md border px-3 py-2 text-sm">
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
