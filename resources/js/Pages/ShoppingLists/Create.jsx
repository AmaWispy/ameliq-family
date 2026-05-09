import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('shopping-lists.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Новый список</h2>}
        >
            <Head title="Новый список" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                            <div>
                                <InputLabel htmlFor="name" value="Название списка" />
                                <TextInput
                                    id="name"
                                    className="mt-1"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.name} />
                            </div>
                            <PrimaryButton disabled={processing}>Создать</PrimaryButton>
                            <Link href={route('shopping-lists.index')} className="rounded-md border px-3 py-2 text-sm">
                                Назад
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
