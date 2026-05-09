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
    IconX
} from '@tabler/icons-react';

const SEARCH_DEBOUNCE_MS = 400;

export default function Index({ notes, filters, hasSecureSession }) {
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
    });

    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // { type: 'show'|'copy', noteId: number }
    const [decryptedContents, setDecryptedContents] = useState({});

    const searchSkipFirstDebounce = useRef(true);
    const skipNextSearchDebounce = useRef(false);

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

    const clearSearch = () => {
        skipNextSearchDebounce.current = true;
        setData('search', '');
        router.get(
            route('notes.index'),
            { search: '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const requestPin = async (action) => {
        setPendingAction(action);
        try {
            await axios.post(route('security.request-pin'));
            setShowPinModal(true);
            setPinError('');
        } catch (error) {
            alert(error.response?.data?.error || 'Ошибка при запросе кода.');
        }
    };

    const verifyPin = async (e) => {
        e.preventDefault();
        try {
            await axios.post(route('security.verify-pin'), { pin });
            setShowPinModal(false);
            setPin('');
            if (pendingAction) {
                executeAction(pendingAction);
            }
        } catch (error) {
            setPinError(error.response?.data?.error || 'Неверный код.');
        }
    };

    const executeAction = async (action) => {
        try {
            if (action.type === 'edit') {
                router.get(route('notes.edit', action.noteId));
                return;
            }

            const response = await axios.get(route('notes.show', action.noteId));
            const content = response.data.content;
            
            if (action.type === 'copy') {
                await navigator.clipboard.writeText(content);
                alert('Скопировано в буфер обмена.');
            } else {
                setDecryptedContents(prev => ({ ...prev, [action.noteId]: content }));
            }
        } catch (error) {
            if (error.response?.status === 403) {
                requestPin(action);
            } else {
                alert('Ошибка при получении данных.');
            }
        }
    };

    const handleNoteAction = (type, noteId) => {
        if (hasSecureSession || decryptedContents[noteId]) {
            executeAction({ type, noteId });
        } else {
            requestPin({ type, noteId });
        }
    };

    const handleEditAction = (note) => {
        if (!note.is_password || hasSecureSession) {
            router.get(route('notes.edit', note.id));
        } else {
            requestPin({ type: 'edit', noteId: note.id });
        }
    };

    const copyPlainNote = async (note) => {
        try {
            await navigator.clipboard.writeText(note.content);
            alert('Текст скопирован в буфер обмена.');
        } catch {
            alert('Не удалось скопировать.');
        }
    };

    const deleteNote = (id) => {
        if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
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
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <Link href={route('notes.create')}>
                            <PrimaryButton className="flex items-center gap-2">
                                <IconPlus size={18} />
                                Добавить заметку
                            </PrimaryButton>
                        </Link>

                        <div className="flex w-full min-w-0 items-center gap-1 sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <TextInput
                                    type="text"
                                    placeholder="Поиск по названию..."
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

                    {notes.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
                            Заметок не найдено.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {notes.data.map((note) => (
                                    <div key={note.id} className={`flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm border-l-4 ${note.is_favorite ? 'border-amber-400' : 'border-indigo-400'}`}>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="line-clamp-2 min-w-0 break-words text-lg font-bold leading-snug text-gray-900" title={note.title}>
                                                    {note.title}
                                                </h3>
                                                {note.is_favorite && (
                                                    <IconStar size={18} className="fill-amber-400 text-amber-400" />
                                                )}
                                            </div>
                                            
                                            <div className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">
                                                {note.is_password && !decryptedContents[note.id] ? (
                                                    <span className="font-mono tracking-widest text-gray-400">••••••••</span>
                                                ) : (
                                                    decryptedContents[note.id] || note.content
                                                )}
                                            </div>

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
                                            {note.is_password && (
                                                <button
                                                    onClick={() => handleNoteAction('show', note.id)}
                                                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                                    title={decryptedContents[note.id] ? 'Скрыть' : 'Показать'}
                                                >
                                                    {decryptedContents[note.id] ? <IconEyeOff size={22} /> : <IconEye size={22} />}
                                                </button>
                                            )}
                                            {note.is_password ? (
                                                <button
                                                    onClick={() => handleNoteAction('copy', note.id)}
                                                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                                    title="Копировать"
                                                >
                                                    <IconCopy size={22} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => copyPlainNote(note)}
                                                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                                    title="Копировать"
                                                >
                                                    <IconCopy size={22} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditAction(note)}
                                                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                                title="Правка"
                                            >
                                                <IconEdit size={22} />
                                            </button>
                                            <button
                                                onClick={() => deleteNote(note.id)}
                                                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                                title="Удалить"
                                            >
                                                <IconTrash size={22} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination links={notes.links} />
                        </>
                    )}
                </div>
            </div>

            <Modal show={showPinModal} onClose={() => setShowPinModal(false)} maxWidth="sm">
                <form onSubmit={verifyPin} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Введите код
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Для доступа к защищенным данным введите код.
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
                        <SecondaryButton onClick={() => setShowPinModal(false)}>
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
