import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { showCopyToast, showToast } from '@/utils/toast';
import {
    IconEye,
    IconEyeOff,
    IconCopy,
    IconEdit,
    IconTrash,
    IconStar,
    IconSearch,
    IconPlus,
    IconUser,
    IconClock,
    IconX,
    IconMapPin,
    IconLock,
    IconExternalLink,
} from '@tabler/icons-react';

const SEARCH_DEBOUNCE_MS = 400;

const TABS = [
    { key: 'note', label: 'Обычные', searchPlaceholder: 'Поиск по названию...' },
    { key: 'password', label: 'Пароли', searchPlaceholder: 'Поиск по названию, ссылке или логину...' },
    { key: 'address', label: 'Адреса', searchPlaceholder: 'Поиск по названию или адресу...' },
];

const TYPE_LABELS = {
    note: 'заметку',
    password: 'пароль',
    address: 'адрес',
};

function normalizeUrl(url) {
    if (!url) {
        return '';
    }
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    return `https://${url}`;
}

function ActionButton({ onClick, title, children, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`rounded-md p-2 transition-colors hover:bg-gray-100 ${
                danger ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-indigo-600'
            }`}
        >
            {children}
        </button>
    );
}

function CopyRow({ label, value, mono = false, onCopy }) {
    if (!value) {
        return null;
    }

    return (
        <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-gray-500">{label}:</span>
            <span className={`min-w-0 truncate font-medium text-gray-800 ${mono ? 'font-mono' : ''}`} title={value}>
                {value}
            </span>
            <button
                type="button"
                onClick={() => onCopy(value, label)}
                className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                title={`Копировать ${label.toLowerCase()}`}
            >
                <IconCopy size={16} />
            </button>
        </div>
    );
}

export default function Index({ notes, filters, passwordTabLocked = false }) {
    const type = filters.type ?? 'note';
    const activeTab = TABS.find((tab) => tab.key === type) ?? TABS[0];

    const { data, setData, get } = useForm({
        type,
        search: filters.search ?? '',
    });

    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [hiddenPasswords, setHiddenPasswords] = useState({});

    const searchSkipFirstDebounce = useRef(true);
    const skipNextSearchDebounce = useRef(false);

    useEffect(() => {
        setData('type', type);
        setData('search', filters.search ?? '');
        setHiddenPasswords({});
    }, [type, filters.search]);

    useEffect(() => {
        if (passwordTabLocked) {
            setShowPinModal(true);
            setPin('');
            setPinError('');
        }
    }, [passwordTabLocked]);

    useEffect(() => {
        if (searchSkipFirstDebounce.current) {
            searchSkipFirstDebounce.current = false;
            return;
        }
        if (skipNextSearchDebounce.current) {
            skipNextSearchDebounce.current = false;
            return;
        }

        const t = setTimeout(() => {
            get(route('notes.index'), {
                preserveState: true,
                preserveScroll: true,
            });
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(t);
    }, [data.search]);

    const switchTab = (nextType) => {
        skipNextSearchDebounce.current = true;
        searchSkipFirstDebounce.current = true;
        setData({ type: nextType, search: '' });
        router.get(
            route('notes.index'),
            { type: nextType, search: '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearSearch = () => {
        skipNextSearchDebounce.current = true;
        setData('search', '');
        router.get(
            route('notes.index'),
            { type, search: '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const verifyPin = async (e) => {
        e.preventDefault();
        try {
            await axios.post(route('security.verify-pin'), { pin });
            setShowPinModal(false);
            setPin('');
            setPinError('');
            router.get(
                route('notes.index'),
                { type: 'password', search: data.search || '' },
                { preserveState: false, preserveScroll: true }
            );
        } catch (error) {
            setPinError(error.response?.data?.error || 'Неверный код.');
        }
    };

    const closePinModal = () => {
        setShowPinModal(false);
        setPin('');
        setPinError('');
        if (passwordTabLocked) {
            switchTab('note');
        }
    };

    const copyText = async (text, label = 'Текст') => {
        try {
            await navigator.clipboard.writeText(text ?? '');
            showCopyToast(label);
        } catch {
            showToast('Не удалось скопировать', 'error');
        }
    };

    const openUrl = (url) => {
        if (!url) {
            return;
        }
        window.open(normalizeUrl(url), '_blank', 'noopener,noreferrer');
    };

    const openMaps = (note) => {
        const query = note.coordinates || note.address;
        if (!query) {
            return;
        }
        window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
    };

    const togglePasswordVisibility = (noteId) => {
        setHiddenPasswords((prev) => ({
            ...prev,
            [noteId]: !prev[noteId],
        }));
    };

    const deleteNote = (id) => {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            router.delete(route('notes.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Заметки</h2>}
        >
            <Head title="Заметки" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-white p-1 shadow-sm">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => switchTab(tab.key)}
                                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                                    type === tab.key
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {tab.key === 'password' ? <IconLock size={16} /> : null}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {!passwordTabLocked && (
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                            <Link href={route('notes.create', { type })}>
                                <PrimaryButton className="flex items-center gap-2">
                                    <IconPlus size={18} />
                                    Добавить {TYPE_LABELS[type]}
                                </PrimaryButton>
                            </Link>

                            <div className="flex w-full min-w-0 items-center gap-1 sm:w-auto">
                                <div className="relative w-full sm:w-80">
                                    <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <TextInput
                                        type="text"
                                        placeholder={activeTab.searchPlaceholder}
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        className="w-full pl-10 pr-10"
                                    />
                                    {data.search ? (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                            title="Очистить поиск"
                                            aria-label="Очистить поиск"
                                        >
                                            <IconX size={18} />
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}

                    {passwordTabLocked ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <IconLock size={36} className="mx-auto text-indigo-500" />
                            <p className="mt-3 text-base font-medium text-gray-800">Раздел паролей защищён</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Введите код, чтобы открыть доступ на время текущей сессии.
                            </p>
                            <PrimaryButton className="mt-4" onClick={() => setShowPinModal(true)}>
                                Ввести код
                            </PrimaryButton>
                        </div>
                    ) : notes.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
                            Записей не найдено.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {notes.data.map((note) => {
                                    const showPassword = hiddenPasswords[note.id] !== true;

                                    return (
                                        <div
                                            key={note.id}
                                            className={`flex items-start justify-between gap-4 rounded-lg border-l-4 bg-white p-4 shadow-sm ${
                                                note.is_favorite ? 'border-amber-400' : 'border-indigo-400'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3
                                                        className="line-clamp-2 min-w-0 break-words text-lg font-bold leading-snug text-gray-900"
                                                        title={note.title}
                                                    >
                                                        {note.title}
                                                    </h3>
                                                    {note.is_favorite && (
                                                        <IconStar size={18} className="shrink-0 fill-amber-400 text-amber-400" />
                                                    )}
                                                </div>

                                                {type === 'note' && (
                                                    <div className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">
                                                        {note.content}
                                                    </div>
                                                )}

                                                {type === 'password' && (
                                                    <div className="mt-2 space-y-1.5 text-sm text-gray-600">
                                                        {note.url ? (
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span className="shrink-0 text-gray-500">Ссылка:</span>
                                                                <span className="min-w-0 truncate text-indigo-600" title={note.url}>
                                                                    {note.url}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openUrl(note.url)}
                                                                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                    title="Открыть ссылку"
                                                                >
                                                                    <IconExternalLink size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyText(note.url, 'Ссылка')}
                                                                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                    title="Копировать ссылку"
                                                                >
                                                                    <IconCopy size={16} />
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                        <CopyRow label="Логин" value={note.login} onCopy={copyText} />
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span className="shrink-0 text-gray-500">Пароль:</span>
                                                            <span
                                                                className="min-w-0 truncate font-mono font-medium text-gray-800"
                                                                title={showPassword ? note.password : undefined}
                                                            >
                                                                {showPassword ? note.password : '••••••••'}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePasswordVisibility(note.id)}
                                                                className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                title={showPassword ? 'Скрыть' : 'Показать'}
                                                            >
                                                                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyText(note.password, 'Пароль')}
                                                                className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                title="Копировать пароль"
                                                            >
                                                                <IconCopy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {type === 'address' && (
                                                    <div className="mt-2 space-y-1.5 text-sm text-gray-600">
                                                        {note.url ? (
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span className="shrink-0 text-gray-500">Ссылка:</span>
                                                                <span className="min-w-0 truncate text-indigo-600" title={note.url}>
                                                                    {note.url}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openUrl(note.url)}
                                                                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                    title="Открыть ссылку"
                                                                >
                                                                    <IconExternalLink size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyText(note.url, 'Ссылка')}
                                                                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                    title="Копировать ссылку"
                                                                >
                                                                    <IconCopy size={16} />
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                        {note.address ? (
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span className="shrink-0 text-gray-500">Адрес:</span>
                                                                <span
                                                                    className="min-w-0 truncate text-gray-800"
                                                                    title={note.address}
                                                                >
                                                                    {note.address}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyText(note.address, 'Адрес')}
                                                                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                    title="Копировать адрес"
                                                                >
                                                                    <IconCopy size={16} />
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                        {note.coordinates ? (
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span className="shrink-0 text-gray-500">Координаты:</span>
                                                                <span className="min-w-0 truncate font-mono text-gray-800" title={note.coordinates}>
                                                                    {note.coordinates}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openMaps(note)}
                                                                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                    title="Открыть на карте"
                                                                >
                                                                    <IconMapPin size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyText(note.coordinates, 'Координаты')}
                                                                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                                                                    title="Копировать координаты"
                                                                >
                                                                    <IconCopy size={16} />
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}

                                                <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <IconUser size={12} /> {note.user_name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <IconClock size={12} /> {note.updated_at}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid shrink-0 grid-cols-2 gap-1">
                                                {type === 'note' && (
                                                    <ActionButton
                                                        onClick={() => copyText(note.content, 'Текст')}
                                                        title="Копировать"
                                                    >
                                                        <IconCopy size={22} />
                                                    </ActionButton>
                                                )}

                                                <ActionButton
                                                    onClick={() => router.get(route('notes.edit', note.id))}
                                                    title="Правка"
                                                >
                                                    <IconEdit size={22} />
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={() => deleteNote(note.id)}
                                                    title="Удалить"
                                                    danger
                                                >
                                                    <IconTrash size={22} />
                                                </ActionButton>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <Pagination links={notes.links} />
                        </>
                    )}
                </div>
            </div>

            <Modal show={showPinModal} onClose={closePinModal} maxWidth="sm">
                <form onSubmit={verifyPin} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Введите код</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Для доступа к разделу паролей введите код. Доступ сохранится до конца сессии.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="pin" value="Код подтверждения" className="sr-only" />
                        <TextInput
                            id="pin"
                            type="text"
                            name="pin"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="mt-1 block w-full text-center text-2xl tracking-[1em]"
                            autoFocus
                            maxLength={4}
                        />
                        <InputError message={pinError} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closePinModal}>
                            Отмена
                        </SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={pin.length !== 4}>
                            Подтвердить
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
