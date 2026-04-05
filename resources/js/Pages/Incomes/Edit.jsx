import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ income, return_filters: returnFilters }) {
    const { data, setData, put, processing, errors } = useForm({
        received_on: income.received_on,
        amount: String(income.amount),
        source: income.source,
        note: income.note ?? '',
        return_start_date: returnFilters.start_date ?? '',
        return_end_date: returnFilters.end_date ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('incomes.update', income.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Редактировать доход</h2>}
        >
            <Head title="Редактировать доход" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="received_on" value="Дата" />
                                <TextInput
                                    id="received_on"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.received_on}
                                    onChange={(e) => setData('received_on', e.target.value)}
                                />
                                <InputError message={errors.received_on} className="mt-1" />
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
                                <InputLabel htmlFor="source" value="Источник" />
                                <TextInput
                                    id="source"
                                    className="mt-1 block w-full"
                                    value={data.source}
                                    onChange={(e) => setData('source', e.target.value)}
                                />
                                <InputError message={errors.source} className="mt-1" />
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
                                <Link href={route('incomes.index')} className="rounded-md border px-3 py-2 text-sm">
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
