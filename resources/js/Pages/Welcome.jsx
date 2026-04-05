import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Добро пожаловать" />
            <div className="min-h-screen bg-gray-100 py-16">
                <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Добро пожаловать в приложение
                        </h1>
                        {auth.user ? (
                            <Link className="text-indigo-600" href={route('dashboard')}>
                                Перейти в админку
                            </Link>
                        ) : (
                            <Link className="text-indigo-600" href={route('login')}>
                                Войти
                            </Link>
                        )}
                    </div>

                    <p className="text-gray-700">
                        Проект использует Laravel v{laravelVersion} и PHP v{phpVersion}.
                    </p>
                </div>
            </div>
        </>
    );
}
