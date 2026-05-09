import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length <= 3) return null;

    return (
        <div className="mt-6 flex flex-wrap justify-center gap-1">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="mb-1 mr-1 rounded border px-4 py-3 text-sm leading-4 text-gray-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`mb-1 mr-1 rounded border px-4 py-3 text-sm leading-4 hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-gray-700'}`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
}
