import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { completeTimeInput, formatTimeInput } from '@/utils/formatTimeInput';
import { TASK_COLORS } from '@/utils/taskColors';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const today = new Date().toISOString().split('T')[0];

function parseYearMonth(value) {
    const [yearString, monthString] = value.split('-');

    return {
        year: Number(yearString) || new Date().getFullYear(),
        month: Number(monthString) || 1,
    };
}

function formatDayMonth(dateKey) {
    const [year, month, day] = dateKey.split('-');

    return `${day}.${month}.${year}`;
}

export default function Create({ defaultDueDate }) {
    const initialDate = defaultDueDate ?? today;
    const { data, setData, post, processing, errors, transform } = useForm({
        title: '',
        description: '',
        due_date: initialDate,
        due_dates: [initialDate],
        due_time: '',
        is_completed: false,
        is_heavy: false,
        color: '',
    });

    const [showMultiDateModal, setShowMultiDateModal] = useState(false);
    const [draftDates, setDraftDates] = useState([initialDate]);
    const [calendarMonth, setCalendarMonth] = useState(initialDate.slice(0, 7));

    const selectedDates = useMemo(
        () => [...(data.due_dates ?? [])].filter(Boolean).sort(),
        [data.due_dates],
    );

    const calendarDate = useMemo(() => {
        const { year, month } = parseYearMonth(calendarMonth);

        return new Date(year, month - 1, 1);
    }, [calendarMonth]);

    const monthLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('ru-RU', {
                month: 'long',
                year: 'numeric',
            }).format(calendarDate),
        [calendarDate],
    );

    const calendarCells = useMemo(() => {
        const year = calendarDate.getFullYear();
        const monthIndex = calendarDate.getMonth();
        const month = monthIndex + 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayIndex = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
        const cells = [];

        for (let index = 0; index < firstDayIndex; index += 1) {
            cells.push(null);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            cells.push({
                day,
                dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            });
        }

        while (cells.length % 7 !== 0) {
            cells.push(null);
        }

        return cells;
    }, [calendarDate]);

    const changeCalendarMonth = (delta) => {
        setCalendarMonth((value) => {
            const { year, month } = parseYearMonth(value);
            const nextMonth = new Date(year, month - 1 + delta, 1);

            return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
        });
    };

    const openMultiDateModal = () => {
        const current = selectedDates.length > 0 ? selectedDates : [data.due_date || today];
        setDraftDates(current);
        setCalendarMonth((current[0] ?? today).slice(0, 7));
        setShowMultiDateModal(true);
    };

    const toggleDraftDate = (dateKey) => {
        setDraftDates((prev) => {
            if (prev.includes(dateKey)) {
                return prev.filter((item) => item !== dateKey);
            }

            return [...prev, dateKey].sort();
        });
    };

    const applyMultiDates = () => {
        const unique = [...new Set(draftDates)].sort();
        if (unique.length === 0) {
            return;
        }

        setData((current) => ({
            ...current,
            due_dates: unique,
            due_date: unique[0],
        }));
        setShowMultiDateModal(false);
    };

    const clearExtraDates = () => {
        const single = data.due_date || today;
        setData((current) => ({
            ...current,
            due_date: single,
            due_dates: [single],
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            due_time: form.due_time ? completeTimeInput(form.due_time) : '',
        }));
        post(route('tasks.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Новая задача</h2>}
        >
            <Head title="Новая задача" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="title" value="Заголовок" />
                                <TextInput
                                    id="title"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                <InputError message={errors.title} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="due_date" value="Дата" />
                                <div className="mt-1 flex items-center gap-2">
                                    <TextInput
                                        id="due_date"
                                        type="date"
                                        className="block w-full"
                                        value={data.due_date}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setData((current) => ({
                                                ...current,
                                                due_date: value,
                                                due_dates: [value],
                                            }));
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={openMultiDateModal}
                                        className="shrink-0 rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                    >
                                        Мультидата
                                    </button>
                                </div>
                                {selectedDates.length > 1 ? (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">
                                            Задача будет создана на {selectedDates.length} дат
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {selectedDates.slice(0, 8).map((dateKey) => (
                                                <span
                                                    key={dateKey}
                                                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                                                >
                                                    {formatDayMonth(dateKey)}
                                                </span>
                                            ))}
                                            {selectedDates.length > 8 ? (
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                    +{selectedDates.length - 8}
                                                </span>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearExtraDates}
                                            className="mt-1 text-xs text-gray-500 underline hover:text-gray-800"
                                        >
                                            Оставить только одну дату
                                        </button>
                                    </div>
                                ) : null}
                                <InputError message={errors.due_date || errors.due_dates} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="due_time" value="Время" />
                                <TextInput
                                    id="due_time"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="00:00"
                                    maxLength={6}
                                    className="mt-1 block w-full max-w-[8rem] font-mono tabular-nums"
                                    value={data.due_time}
                                    onChange={(e) => setData('due_time', formatTimeInput(e.target.value, data.due_time))}
                                    onBlur={() => setData('due_time', completeTimeInput(data.due_time))}
                                />
                                <InputError message={errors.due_time} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="description" value="Описание" />
                                <textarea
                                    id="description"
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel value="Цвет" />
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('color', '')}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                            !data.color
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Без цвета
                                    </button>
                                    {TASK_COLORS.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            title={item.label}
                                            onClick={() => setData('color', item.value)}
                                            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm ${
                                                data.color === item.value
                                                    ? 'border-gray-900 bg-white shadow-sm'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span
                                                className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                                                style={{ backgroundColor: item.hex }}
                                            />
                                            <span className="text-gray-700">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.color} className="mt-1" />
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_completed}
                                    onChange={(e) => setData('is_completed', e.target.checked)}
                                />
                                Выполнено
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_heavy}
                                    onChange={(e) => setData('is_heavy', e.target.checked)}
                                />
                                Тяжёлая задача
                                <span className="text-xs text-gray-500">(день выделится в календаре)</span>
                            </label>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <PrimaryButton disabled={processing}>Создать</PrimaryButton>
                                <Link href={route('tasks.index')} className="rounded-md border px-3 py-2 text-sm">
                                    Назад
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Modal show={showMultiDateModal} onClose={() => setShowMultiDateModal(false)} maxWidth="lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Выберите даты</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Нажмите на дни — задача продублируется на каждую выбранную дату. Можно листать месяцы вперёд.
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => changeCalendarMonth(-1)}
                            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Назад
                        </button>
                        <p className="text-sm capitalize text-gray-700">{monthLabel}</p>
                        <button
                            type="button"
                            onClick={() => changeCalendarMonth(1)}
                            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Вперёд
                        </button>
                    </div>

                    <div className="mt-3 mb-1 grid grid-cols-7 gap-1">
                        {WEEK_DAYS.map((dayName) => (
                            <div key={dayName} className="py-1 text-center text-xs font-medium text-gray-500">
                                {dayName}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarCells.map((cell, index) =>
                            cell ? (
                                <button
                                    key={cell.dateKey}
                                    type="button"
                                    onClick={() => toggleDraftDate(cell.dateKey)}
                                    className={`min-h-10 rounded-md border p-2 text-sm font-medium transition-colors ${
                                        draftDates.includes(cell.dateKey)
                                            ? 'border-indigo-500 bg-indigo-600 text-white'
                                            : cell.dateKey === today
                                              ? 'border-indigo-300 bg-indigo-50 text-gray-800'
                                              : 'border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50'
                                    }`}
                                >
                                    {cell.day}
                                </button>
                            ) : (
                                <div key={`empty-${index}`} className="min-h-10 rounded-md bg-gray-50" />
                            ),
                        )}
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                        Выбрано: {draftDates.length}
                    </p>

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton onClick={() => setShowMultiDateModal(false)}>Отмена</SecondaryButton>
                        <PrimaryButton type="button" onClick={applyMultiDates} disabled={draftDates.length === 0}>
                            Применить
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
