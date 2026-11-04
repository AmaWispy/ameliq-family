import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { IconStar } from '@tabler/icons-react';

const today = new Date().toISOString().split('T')[0];

function formatMoney(value) {
    return Number(value).toFixed(2);
}

export default function Show({ account, categories = [] }) {
    const isDebt = account.is_negative;
    const percent = account.goal_amount
        ? (Number(account.balance) / Number(account.goal_amount)) * 100
        : null;

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'deposit',
        amount: '',
        note: '',
        happened_on: today,
        create_expense: false,
        deduct_from_balance: false,
        expense_category_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('accounts.transactions.store', account.id), {
            onSuccess: () => reset('amount', 'note'),
        });
    };

    const depositLabel = isDebt ? 'Взять в долг' : 'Пополнить';
    const withdrawalLabel = isDebt ? 'Погасить' : 'Снять';

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{account.name}</h2>}>
            <Head title={account.name} />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800">Новая операция</h3>
                        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-4">
                            <div>
                                <InputLabel htmlFor="type" value="Тип" />
                                <select
                                    id="type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                >
                                    <option value="deposit">{depositLabel}</option>
                                    <option value="withdrawal">{withdrawalLabel}</option>
                                </select>
                                <InputError className="mt-1" message={errors.type} />
                            </div>
                            <div>
                                <InputLabel htmlFor="amount" value="Сумма *" />
                                <TextInput
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="mt-1 block w-full"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    required
                                />
                                <InputError className="mt-1" message={errors.amount} />
                            </div>
                            <div>
                                <InputLabel htmlFor="happened_on" value="Дата" />
                                <TextInput
                                    id="happened_on"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.happened_on}
                                    onChange={(e) => setData('happened_on', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.happened_on} />
                            </div>
                            <div>
                                <InputLabel htmlFor="note" value="Комментарий" />
                                <TextInput
                                    id="note"
                                    className="mt-1 block w-full"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.note} />
                            </div>
                            {!isDebt ? (
                                <div className="grid gap-2 md:col-span-4">
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <Checkbox
                                            checked={data.deduct_from_balance}
                                            onChange={(e) => setData('deduct_from_balance', e.target.checked)}
                                        />
                                        {data.type === 'deposit' ? 'Снять с баланса и остатка' : 'Вернуть в баланс и остаток'}
                                    </label>
                                    {data.deduct_from_balance && !(data.type === 'deposit' && data.create_expense) ? (
                                        <p className="text-xs text-gray-500">
                                            {data.type === 'deposit'
                                                ? 'Сумма уменьшит баланс за период и общий остаток. В расходы не попадёт.'
                                                : 'Сумма увеличит баланс за период и общий остаток.'}
                                        </p>
                                    ) : null}
                                    {data.type === 'deposit' ? (
                                        <>
                                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                                <Checkbox
                                                    checked={data.create_expense}
                                                    onChange={(e) => setData('create_expense', e.target.checked)}
                                                />
                                                Создать расход
                                            </label>
                                            {data.create_expense ? (
                                                <div className="max-w-sm">
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
                                                        Сумма спишется с общего баланса и будет отдельно отмечена как перевод в эту копилку.
                                                    </p>
                                                    <InputError className="mt-1" message={errors.expense_category_id} />
                                                </div>
                                            ) : null}
                                        </>
                                    ) : null}
                                </div>
                            ) : null}
                            <div className="md:col-span-4">
                                <PrimaryButton disabled={processing}>Сохранить операцию</PrimaryButton>
                            </div>
                        </form>
                    </div>

                    <div className={`rounded-lg p-6 shadow-sm ${isDebt ? 'border border-red-200 bg-red-50' : 'bg-white'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className={`text-2xl font-semibold ${isDebt ? 'text-red-800' : 'text-gray-900'}`}>
                                        {account.name}
                                    </h2>
                                    {isDebt ? (
                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                                            Долг / кредит
                                        </span>
                                    ) : null}
                                    {account.is_favorite ? (
                                        <IconStar size={18} className="fill-amber-400 text-amber-400" />
                                    ) : null}
                                </div>
                                {account.note ? <p className="mt-1 text-sm text-gray-600">{account.note}</p> : null}
                                <p className={`mt-3 text-4xl font-semibold tabular-nums ${isDebt ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {isDebt ? '−' : ''}
                                    {formatMoney(Math.abs(account.balance))}
                                </p>
                                {account.goal_amount ? (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Цель: {formatMoney(account.goal_amount)}
                                        {percent !== null ? ` · ${percent.toFixed(0)}%` : ''}
                                        {percent !== null && percent > 100 ? ' (больше цели)' : ''}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    title={account.is_favorite ? 'Убрать из избранного' : 'В избранное'}
                                    onClick={() => router.patch(route('accounts.toggle-favorite', account.id))}
                                    className="rounded-md border bg-white p-2"
                                >
                                    <IconStar
                                        size={18}
                                        className={account.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}
                                    />
                                </button>
                                <Link href={route('accounts.index')} className="rounded-md border bg-white px-3 py-2 text-sm">
                                    К копилке
                                </Link>
                                <Link href={route('accounts.edit', account.id)} className="rounded-md border bg-white px-3 py-2 text-sm">
                                    Редактировать
                                </Link>
                            </div>
                        </div>
                        {percent !== null ? (
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
                                <div
                                    className={`h-full rounded-full ${isDebt ? 'bg-red-500' : percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-800">История</h3>
                        {account.transactions.length === 0 ? (
                            <p className="text-sm text-gray-600">Пока нет операций.</p>
                        ) : (
                            <div className="space-y-2">
                                {account.transactions.map((transaction) => {
                                    const isDeposit = transaction.type === 'deposit';

                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between gap-3 rounded border p-3"
                                        >
                                            <div className="min-w-0">
                                                <p className={`font-medium ${isDeposit ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {isDeposit ? '+' : '−'}
                                                    {formatMoney(transaction.amount)}
                                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                                        {isDeposit ? depositLabel : withdrawalLabel}
                                                    </span>
                                                </p>
                                                {transaction.note ? (
                                                    <p className="text-sm text-gray-600">{transaction.note}</p>
                                                ) : null}
                                                {transaction.expense ? (
                                                    <p className="text-xs text-amber-700">
                                                        Расход: {transaction.expense.category_name}
                                                    </p>
                                                ) : null}
                                                {transaction.deducts_balance ? (
                                                    <p className="text-xs text-amber-700">
                                                        {isDeposit
                                                            ? 'Снято с баланса и остатка'
                                                            : 'Возвращено в баланс и остаток'}
                                                    </p>
                                                ) : null}
                                                <p className="text-xs text-gray-400">
                                                    {transaction.happened_on_label}
                                                    {transaction.user_name ? ` · ${transaction.user_name}` : ''}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                title="Удалить"
                                                className="rounded-md border border-red-300 p-2 text-sm text-red-700"
                                                onClick={() => {
                                                    if (!window.confirm(transaction.expense ? 'Удалить операцию и связанный расход?' : 'Удалить операцию?')) return;
                                                    router.delete(
                                                        route('accounts.transactions.destroy', [account.id, transaction.id]),
                                                    );
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
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
