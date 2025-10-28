import React from 'react';
import { Link } from 'react-router-dom';

const genres = [
    { name: 'Сёнэн', id: '27' },
    { name: 'Драма', id: '8' },
    { name: 'Фэнтези', id: '10' },
    { name: 'Экшен', id: '1' },
    { name: 'Комедия', id: '4' },
    { name: 'Приключения', id: '2' },
    { name: 'Романтика', id: '22' },
    { name: 'Фантастика', id: '24' },
];

export const GenreExplorer: React.FC = () => {
    return (
        <section>
             <h2 className="text-2xl font-bold text-white mb-4">Исследуйте жанры</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {genres.map(genre => (
                    <Link
                        to={`/catalog?genre=${genre.id}`}
                        key={genre.id}
                        className="text-center font-semibold text-white bg-zinc-800/50 rounded-lg py-6 px-4 hover:bg-purple-600/50 hover:scale-105 transition-all duration-300"
                    >
                        {genre.name}
                    </Link>
                ))}
             </div>
        </section>
    );
};
